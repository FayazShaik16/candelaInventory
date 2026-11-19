from fastapi import APIRouter, Depends, HTTPException, status
from ..schemas.requests import ActionConfirmRequest, ActionCancelRequest
from ..schemas.responses import ActionExecutionResult
from ..security.authentication import AuthenticatedUser, get_current_user
from ..security.authorization import assert_admin
from ..services.confirmation_service import confirmation_service
from ..services.inventory_service import repo
from ..services.assignment_service import assignment_service
from ..services.audit_service import audit_service

router = APIRouter(prefix="/actions", tags=["actions"])

@router.post("/confirm", response_model=ActionExecutionResult)
async def confirm_action(
    req: ActionConfirmRequest,
    user: AuthenticatedUser = Depends(get_current_user)
):
    assert_admin(user)

    # 1. Validate and consume token (enforces single-use & expiry)
    payload = confirmation_service.verify_and_consume_token(req.confirmation_token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired confirmation token. The operation has timed out or was already executed."
        )

    intent = payload.get("intent")
    cat = payload.get("category")
    eq_id = payload.get("equipment_id")
    tag = payload.get("equipment_tag")

    updated_record = None
    success_msg = ""

    # 2. Execute validated trusted operation
    if intent == "equipment_assignment":
        emp_id = payload["employee_id"]
        emp_name = payload["employee_name"]
        asgn = assignment_service.assign(cat, eq_id, tag, emp_id, emp_name, user.full_name)
        
        # Update repo status & PoC
        if cat == "lanforge":
            lf = repo.find_lanforge(eq_id)
            if lf:
                lf["status"] = "In-Use"
                lf["poc_id"] = emp_id
                lf["poc_name"] = emp_name
                updated_record = lf
        elif cat == "desktop":
            dt = repo.find_desktop(eq_id)
            if dt:
                dt["status"] = "In-Use"
                dt["poc_id"] = emp_id
                dt["poc_name"] = emp_name
                updated_record = dt
        elif cat == "mobile":
            mb = repo.find_mobile(eq_id)
            if mb:
                mb["status"] = "In-Use"
                mb["poc_id"] = emp_id
                mb["poc_name"] = emp_name
                updated_record = mb
        elif cat == "chamber":
            ch = repo.find_chamber(eq_id)
            if ch:
                ch["status"] = "In-Use"
                ch["used_by_id"] = emp_id
                ch["used_by_name"] = emp_name
                updated_record = ch

        success_msg = f"{tag} has been assigned to {emp_name} successfully. Status shifted to In-Use."

    elif intent == "equipment_return":
        assignment_service.return_eq(cat, eq_id, user.full_name)
        if cat == "lanforge":
            lf = repo.find_lanforge(eq_id)
            if lf:
                lf["status"] = "Available"
                lf["poc_id"] = None
                lf["poc_name"] = "Unassigned"
                updated_record = lf
        elif cat == "desktop":
            dt = repo.find_desktop(eq_id)
            if dt:
                dt["status"] = "Available"
                dt["poc_id"] = None
                dt["poc_name"] = "Unassigned"
                updated_record = dt
        elif cat == "mobile":
            mb = repo.find_mobile(eq_id)
            if mb:
                mb["status"] = "Available"
                mb["poc_id"] = None
                mb["poc_name"] = "Unassigned"
                updated_record = mb
        elif cat == "chamber":
            ch = repo.find_chamber(eq_id)
            if ch:
                ch["status"] = "Available"
                ch["used_by_id"] = None
                ch["used_by_name"] = "Unassigned"
                updated_record = ch

        success_msg = f"{tag} has been returned to inventory pool. Status reset to Available."

    elif intent == "equipment_transfer":
        to_emp_id = payload["to_employee_id"]
        to_emp_name = payload["to_employee_name"]
        assignment_service.transfer(cat, eq_id, tag, to_emp_id, to_emp_name, user.full_name)

        if cat == "lanforge":
            lf = repo.find_lanforge(eq_id)
            if lf:
                lf["poc_id"] = to_emp_id
                lf["poc_name"] = to_emp_name
                updated_record = lf
        elif cat == "desktop":
            dt = repo.find_desktop(eq_id)
            if dt:
                dt["poc_id"] = to_emp_id
                dt["poc_name"] = to_emp_name
                updated_record = dt
        elif cat == "mobile":
            mb = repo.find_mobile(eq_id)
            if mb:
                mb["poc_id"] = to_emp_id
                mb["poc_name"] = to_emp_name
                updated_record = mb
        elif cat == "chamber":
            ch = repo.find_chamber(eq_id)
            if ch:
                ch["used_by_id"] = to_emp_id
                ch["used_by_name"] = to_emp_name
                updated_record = ch

        success_msg = f"{tag} custody transferred to {to_emp_name} successfully."

    elif intent == "radio_configuration_update":
        chipset = payload["chipset"]
        qty = payload["quantity"]
        op = payload.get("operation", "set_quantity")
        repo.update_lanforge_radios(eq_id, chipset, qty, op)
        updated_record = repo.find_lanforge(eq_id)
        success_msg = f"{tag} radio hardware updated successfully: {chipset} quantity set to {qty}."

    elif intent == "status_update":
        t_status = payload["target_status"]
        if cat == "lanforge":
            lf = repo.find_lanforge(eq_id)
            if lf:
                lf["status"] = t_status
                updated_record = lf
        elif cat == "desktop":
            dt = repo.find_desktop(eq_id)
            if dt:
                dt["status"] = t_status
                updated_record = dt
        elif cat == "mobile":
            mb = repo.find_mobile(eq_id)
            if mb:
                mb["status"] = t_status
                updated_record = mb
        elif cat == "chamber":
            ch = repo.find_chamber(eq_id)
            if ch:
                ch["status"] = t_status
                updated_record = ch

        success_msg = f"{tag} status shifted to '{t_status}' successfully."

    elif intent == "location_update":
        t_loc = payload["location"]
        if cat == "lanforge":
            lf = repo.find_lanforge(eq_id)
            if lf:
                lf["location"] = t_loc
                updated_record = lf
        success_msg = f"{tag} relocated to facility '{t_loc}' successfully."

    elif intent == "model_update":
        success_msg = f"{tag} model specification updated successfully."
        if cat == "mobile":
            mb = repo.find_mobile(eq_id)
            if mb:
                updated_record = mb
        elif cat == "desktop":
            dt = repo.find_desktop(eq_id)
            if dt:
                updated_record = dt

    # 3. Record audit event
    audit_id = audit_service.record_event(
        action_type=intent,
        performed_by=user.full_name,
        description=success_msg,
        inventory_type=cat,
        inventory_id=eq_id,
        inventory_tag=tag
    )

    return ActionExecutionResult(
        success=True,
        message=success_msg,
        action_id=req.action_id or payload.get("action_id") or "act-confirmed",
        updated_record=updated_record,
        audit_log_id=audit_id
    )

@router.post("/cancel")
async def cancel_action(
    req: ActionCancelRequest,
    user: AuthenticatedUser = Depends(get_current_user)
):
    if req.confirmation_token:
        confirmation_service.cancel_token(req.confirmation_token)
    return {"success": True, "message": "Action cancelled successfully."}
