import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from ..schemas.requests import ChatMessageRequest
from ..schemas.responses import ChatMessageResponse
from ..schemas.actions import ActionPreviewDTO, FieldChangeDTO, QueryResultItemDTO
from ..security.authentication import AuthenticatedUser, get_current_user
from ..security.authorization import can_modify_inventory
from ..services.inventory_service import repo
from ..services.assignment_service import assignment_service
from ..services.validation_service import validation_service
from ..services.confirmation_service import confirmation_service
from ..ai.model import ai_model

router = APIRouter(prefix="", tags=["chat"])

@router.post("/chat", response_model=ChatMessageResponse)
async def handle_chat_message(
    req: ChatMessageRequest,
    user: AuthenticatedUser = Depends(get_current_user)
):
    msg_id = f"msg-{uuid.uuid4().hex[:8]}"
    conv_id = req.conversation_id or f"conv-{uuid.uuid4().hex[:8]}"
    timestamp = datetime.now(timezone.utc).strftime("%I:%M %p")
    text = req.message.strip()

    # 1. Parse natural language instruction
    ai_output = await ai_model.parse_instruction(text, req.context_unit_tag)
    intent = ai_output.intent

    # -------------------------------------------------------------
    # INTENT: INVENTORY QUERY
    # -------------------------------------------------------------
    if intent == "inventory_query":
        results: List[QueryResultItemDTO] = []
        target_cat = ai_output.category
        target_status = ai_output.target_status
        target_loc = ai_output.location

        # LANforges
        if not target_cat or target_cat == "lanforge":
            for lf in repo.lanforges:
                if target_status and lf["status"] != target_status: continue
                if target_loc and lf["location"] != target_loc: continue
                if ai_output.record_identifier and ai_output.record_identifier.lower() not in lf["lanforge_id"].lower(): continue
                results.append(QueryResultItemDTO(
                    id=lf["id"], tag=lf["lanforge_id"], model=lf["lanforge_model"],
                    category="lanforge", status=lf["status"], location=lf["location"],
                    custodian=lf.get("poc_name"), details={"ip": lf["testbed_ip"], "clients": lf["total_clients"]}
                ))

        # Desktops
        if not target_cat or target_cat == "desktop":
            for dt in repo.desktops:
                if target_status and dt["status"] != target_status: continue
                if ai_output.record_identifier and ai_output.record_identifier.lower() not in dt["device_id"].lower(): continue
                results.append(QueryResultItemDTO(
                    id=dt["id"], tag=dt["device_id"], model=f"{dt['device_brand']} {dt['model']}",
                    category="desktop", status=dt["status"], custodian=dt.get("poc_name"), details={"project": dt["project"]}
                ))

        # Mobiles
        if not target_cat or target_cat == "mobile":
            for mb in repo.mobiles:
                if target_status and mb["status"] != target_status: continue
                if ai_output.record_identifier and ai_output.record_identifier.lower() not in mb["device_id"].lower(): continue
                results.append(QueryResultItemDTO(
                    id=mb["id"], tag=mb["device_id"], model=f"{mb['device_brand']} {mb['model']}",
                    category="mobile", status=mb["status"], custodian=mb.get("poc_name"), details={"project": mb["project"]}
                ))

        # Chambers
        if not target_cat or target_cat == "chamber":
            for ch in repo.chambers:
                if target_status and ch["status"] != target_status: continue
                if ai_output.record_identifier and ai_output.record_identifier.lower() not in ch["chamber_id"].lower(): continue
                results.append(QueryResultItemDTO(
                    id=ch["id"], tag=ch["chamber_id"], model=ch["chamber_type"],
                    category="chamber", status=ch["status"], custodian=ch.get("used_by_name"), details={"project": ch["project"]}
                ))

        count = len(results)
        summary_text = f"I found {count} matching inventory record{'s' if count != 1 else ''}:"
        if count == 0:
            summary_text = "No hardware records matched your query criteria in the active inventory."

        return ChatMessageResponse(
            message_id=msg_id, conversation_id=conv_id, timestamp=timestamp,
            text=summary_text, query_results=results[:10]
        )

    # -------------------------------------------------------------
    # INTENT: ASSIGNMENT HISTORY / PREVIOUS USER QUERY
    # -------------------------------------------------------------
    if intent == "assignment_history_query":
        if not ai_output.record_identifier:
            return ChatMessageResponse(
                message_id=msg_id, conversation_id=conv_id, timestamp=timestamp,
                text="Please specify which equipment ID you would like to inspect the history for (e.g. LF-521B-001 or CT521A)."
            )

        cat, item = validation_service.resolve_equipment(ai_output.record_identifier, ai_output.category)
        if not item:
            return ChatMessageResponse(
                message_id=msg_id, conversation_id=conv_id, timestamp=timestamp,
                text=f"I couldn't find an inventory record matching identifier '{ai_output.record_identifier}'. Please verify the unit tag."
            )

        history = assignment_service.get_equipment_history(item["id"])
        tag = item.get("lanforge_id") or item.get("device_id") or item.get("chamber_id")
        
        if not history:
            return ChatMessageResponse(
                message_id=msg_id, conversation_id=conv_id, timestamp=timestamp,
                text=f"No previous custody records found for {tag}. It has not been previously checked out."
            )

        history_lines = []
        for h in history:
            status_desc = "Currently Active" if h["assignment_status"] == "active" else f"Returned on {h.get('returned_at', '')[:10]}"
            history_lines.append(f"• Custodian: {h['employee_name']} ({status_desc}) | Assigned by: {h['assigned_by']}")

        return ChatMessageResponse(
            message_id=msg_id, conversation_id=conv_id, timestamp=timestamp,
            text=f"Custody history for {tag}:\n\n" + "\n".join(history_lines)
        )

    # -------------------------------------------------------------
    # INTENT: CURRENT CUSTODIAN QUERY (e.g. "Who is currently using MOB002?")
    # -------------------------------------------------------------
    if intent == "current_custodian_query":
        if not ai_output.record_identifier:
            return ChatMessageResponse(
                message_id=msg_id, conversation_id=conv_id, timestamp=timestamp,
                text="Please specify which equipment ID you would like to query (e.g. MOB002, CT521B, DESK001)."
            )

        cat, item = validation_service.resolve_equipment(ai_output.record_identifier, ai_output.category)
        if not item:
            return ChatMessageResponse(
                message_id=msg_id, conversation_id=conv_id, timestamp=timestamp,
                text=f"I couldn't find an inventory record matching identifier '{ai_output.record_identifier}'. Please verify the unit tag."
            )

        tag = item.get("lanforge_id") or item.get("device_id") or item.get("chamber_id")
        custodian = item.get("poc_name") or item.get("used_by_name") or "Unassigned"
        status_val = item.get("status")
        model_name = item.get("lanforge_model") or item.get("model") or item.get("chamber_type")

        if custodian != "Unassigned":
            text_resp = f"**{tag}** ({model_name}) is currently assigned to and operated by **{custodian}** (Status: {status_val})."
        else:
            text_resp = f"**{tag}** ({model_name}) is currently unassigned (Status: {status_val}) with no active custodian."

        return ChatMessageResponse(
            message_id=msg_id, conversation_id=conv_id, timestamp=timestamp,
            text=text_resp,
            query_results=[
                QueryResultItemDTO(
                    id=item["id"], tag=tag,
                    model=model_name,
                    category=cat, status=status_val, custodian=custodian,
                    details={"poc_name": custodian, "project": item.get("project")}
                )
            ]
        )

    # -------------------------------------------------------------
    # INTENT: CLIENT SPECS QUERY (e.g. "How many 11be clients does CT523C have?")
    # -------------------------------------------------------------
    if intent == "client_specs_query":
        cat, item = validation_service.resolve_equipment(ai_output.record_identifier, "lanforge")
        if not item:
            return ChatMessageResponse(
                message_id=msg_id, conversation_id=conv_id, timestamp=timestamp,
                text=f"LANforge testbed '{ai_output.record_identifier}' was not found in the inventory registry."
            )

        tag = item["lanforge_id"]
        be_clients = item.get("no_of_11be_clients", 0)
        ax_clients = item.get("no_of_11ax_clients", 0)
        ac_clients = item.get("no_of_11ac_clients", 0)
        n_clients = item.get("no_of_11n_clients", 0)
        total_clients = item.get("total_clients", 0)
        model = item.get("lanforge_model")

        text_resp = (
            f"**{tag}** ({model}) is configured with:\n"
            f"• **11be Clients (Wi-Fi 7):** {be_clients}\n"
            f"• **11ax Clients (Wi-Fi 6/6E):** {ax_clients}\n"
            f"• **11ac Clients (Wi-Fi 5):** {ac_clients}\n"
            f"• **11n Clients:** {n_clients}\n"
            f"• **Total Clients Capacity:** {total_clients}\n"
            f"• **Max Ethernet Speed:** {item.get('max_ethernet_speed')}\n"
            f"• **Testbed IP:** {item.get('testbed_ip')}"
        )
        return ChatMessageResponse(
            message_id=msg_id, conversation_id=conv_id, timestamp=timestamp,
            text=text_resp,
            query_results=[
                QueryResultItemDTO(
                    id=item["id"], tag=tag, model=model, category="lanforge",
                    status=item["status"], location=item["location"], custodian=item.get("poc_name"),
                    details={"ip": item["testbed_ip"], "clients": total_clients, "11be": be_clients}
                )
            ]
        )

    # -------------------------------------------------------------
    # INTENT: EMPLOYEE INVENTORY QUERY
    # -------------------------------------------------------------
    if intent == "employee_inventory_query":
        target_emp_name = ai_output.employee_name or user.full_name
        emp = repo.find_employee(target_emp_name)
        if not emp:
            return ChatMessageResponse(
                message_id=msg_id, conversation_id=conv_id, timestamp=timestamp,
                text=f"Employee '{target_emp_name}' was not found in the Candela directory."
            )

        emp_asgns = [a for a in assignment_service.get_employee_assignments(emp["id"]) if a["assignment_status"] == "active"]
        count = len(emp_asgns)
        
        if count == 0:
            return ChatMessageResponse(
                message_id=msg_id, conversation_id=conv_id, timestamp=timestamp,
                text=f"{emp['full_name']} currently has no active hardware assignments.",
                query_results=[]
            )

        lines = [f"• {a['inventory_tag']} ({a['inventory_type'].upper()}) — Assigned: {a['assigned_at'][:10]}" for a in emp_asgns]
        emp_results = [
            QueryResultItemDTO(
                id=a["inventory_id"],
                tag=a["inventory_tag"],
                model=a["inventory_type"].upper(),
                category=a["inventory_type"],
                status="In-Use",
                custodian=emp["full_name"],
                details={"assigned_at": a["assigned_at"][:10]}
            )
            for a in emp_asgns
        ]
        return ChatMessageResponse(
            message_id=msg_id, conversation_id=conv_id, timestamp=timestamp,
            text=f"Active hardware assigned to {emp['full_name']} ({count} total units):\n\n" + "\n".join(lines),
            query_results=emp_results
        )

    # -------------------------------------------------------------
    # MUTATION INTENTS (REQUIRE ADMIN CLEARANCE & CONFIRMATION)
    # -------------------------------------------------------------
    if not can_modify_inventory(user):
        return ChatMessageResponse(
            message_id=msg_id, conversation_id=conv_id, timestamp=timestamp,
            text="⚠️ Permission Denied: Your employee role does not have authorization to commit inventory changes or assignments. Please request an administrator to approve this operation."
        )

    # Resolve equipment
    identifier = ai_output.record_identifier
    if not identifier:
        return ChatMessageResponse(
            message_id=msg_id, conversation_id=conv_id, timestamp=timestamp,
            text="Please specify the unit ID or tag for this operation (e.g. LF-521B-001, DT-DELL-01, CH-ISO-01)."
        )

    cat, item = validation_service.resolve_equipment(identifier, ai_output.category)
    if not item:
        return ChatMessageResponse(
            message_id=msg_id, conversation_id=conv_id, timestamp=timestamp,
            text=f"I couldn't find a record matching identifier '{identifier}'. Please verify the hardware tag."
        )

    tag = item.get("lanforge_id") or item.get("device_id") or item.get("chamber_id")
    action_id = f"act-{uuid.uuid4().hex[:8]}"

    # A. Intent: Equipment Assignment
    if intent == "equipment_assignment":
        if not ai_output.employee_name:
            return ChatMessageResponse(
                message_id=msg_id, conversation_id=conv_id, timestamp=timestamp,
                text=f"Which employee should {tag} be assigned to? Please specify an engineer name."
            )

        valid_res = validation_service.validate_assignment_preconditions(cat, item, ai_output.employee_name)
        if not valid_res["valid"]:
            return ChatMessageResponse(
                message_id=msg_id, conversation_id=conv_id, timestamp=timestamp,
                text=f"⚠️ {valid_res['error']}"
            )

        target_emp = valid_res["employee"]
        payload = {
            "intent": "equipment_assignment",
            "category": cat,
            "equipment_id": item["id"],
            "equipment_tag": tag,
            "employee_id": target_emp["id"],
            "employee_name": target_emp["full_name"],
            "assigned_by": user.full_name
        }
        token = confirmation_service.create_confirmation_token(action_id, payload)

        preview = ActionPreviewDTO(
            id=action_id,
            intent=intent,
            category=cat,
            record_identifier=tag,
            title=f"Assign Equipment: {tag}",
            description=f"Allocate hardware custody to {target_emp['full_name']} ({target_emp['email']}).",
            changes=[
                FieldChangeDTO(field="Custodian", from_value=item.get("poc_name") or item.get("used_by_name") or "Unassigned", to_value=target_emp["full_name"]),
                FieldChangeDTO(field="Status", from_value=item["status"], to_value="In-Use"),
            ],
            requires_confirmation=True,
            confirmation_token=token,
            payload=payload
        )

        return ChatMessageResponse(
            message_id=msg_id, conversation_id=conv_id, timestamp=timestamp,
            text=f"I have verified availability for {tag} and prepared an equipment assignment record for {target_emp['full_name']}. Please review and confirm below:",
            action_preview=preview
        )

    # B. Intent: Equipment Return
    if intent == "equipment_return":
        active_asgn = assignment_service.get_active_assignment(cat, item["id"])
        if not active_asgn:
            return ChatMessageResponse(
                message_id=msg_id, conversation_id=conv_id, timestamp=timestamp,
                text=f"{tag} does not currently have an active assignment to return (Status: {item['status']})."
            )

        payload = {
            "intent": "equipment_return",
            "category": cat,
            "equipment_id": item["id"],
            "equipment_tag": tag,
            "returned_by": user.full_name
        }
        token = confirmation_service.create_confirmation_token(action_id, payload)

        preview = ActionPreviewDTO(
            id=action_id,
            intent=intent,
            category=cat,
            record_identifier=tag,
            title=f"Return Equipment: {tag}",
            description=f"Check in hardware from current custodian {active_asgn['employee_name']}.",
            changes=[
                FieldChangeDTO(field="Custodian", from_value=active_asgn["employee_name"], to_value="Unassigned"),
                FieldChangeDTO(field="Status", from_value=item["status"], to_value="Available"),
            ],
            requires_confirmation=True,
            confirmation_token=token,
            payload=payload
        )

        return ChatMessageResponse(
            message_id=msg_id, conversation_id=conv_id, timestamp=timestamp,
            text=f"Prepared return check-in for {tag} from custodian {active_asgn['employee_name']}. Please confirm:",
            action_preview=preview
        )

    # C. Intent: Equipment Transfer
    if intent == "equipment_transfer":
        if not ai_output.employee_name:
            return ChatMessageResponse(
                message_id=msg_id, conversation_id=conv_id, timestamp=timestamp,
                text=f"Which employee would you like to transfer {tag} to?"
            )

        active_asgn = assignment_service.get_active_assignment(cat, item["id"])
        if not active_asgn:
            return ChatMessageResponse(
                message_id=msg_id, conversation_id=conv_id, timestamp=timestamp,
                text=f"{tag} does not have an active assignment to transfer."
            )

        target_emp = repo.find_employee(ai_output.employee_name)
        if not target_emp:
            return ChatMessageResponse(
                message_id=msg_id, conversation_id=conv_id, timestamp=timestamp,
                text=f"Target employee '{ai_output.employee_name}' was not found in directory."
            )

        if target_emp["id"] == active_asgn["employee_id"]:
            return ChatMessageResponse(
                message_id=msg_id, conversation_id=conv_id, timestamp=timestamp,
                text=f"{tag} is already assigned to {target_emp['full_name']}."
            )

        payload = {
            "intent": "equipment_transfer",
            "category": cat,
            "equipment_id": item["id"],
            "equipment_tag": tag,
            "to_employee_id": target_emp["id"],
            "to_employee_name": target_emp["full_name"],
            "transferred_by": user.full_name
        }
        token = confirmation_service.create_confirmation_token(action_id, payload)

        preview = ActionPreviewDTO(
            id=action_id,
            intent=intent,
            category=cat,
            record_identifier=tag,
            title=f"Transfer Custody: {tag}",
            description=f"Transfer custody from {active_asgn['employee_name']} to {target_emp['full_name']}.",
            changes=[
                FieldChangeDTO(field="Custodian", from_value=active_asgn["employee_name"], to_value=target_emp["full_name"]),
                FieldChangeDTO(field="Status", from_value="In-Use", to_value="In-Use"),
            ],
            requires_confirmation=True,
            confirmation_token=token,
            payload=payload
        )

        return ChatMessageResponse(
            message_id=msg_id, conversation_id=conv_id, timestamp=timestamp,
            text=f"Prepared atomic transfer of {tag} from {active_asgn['employee_name']} to {target_emp['full_name']}. Please confirm:",
            action_preview=preview
        )

    # D. Intent: Radio Configuration Update (LANforge)
    if intent == "radio_configuration_update":
        if cat != "lanforge":
            return ChatMessageResponse(
                message_id=msg_id, conversation_id=conv_id, timestamp=timestamp,
                text="Radio configuration updates apply exclusively to LANforge hardware."
            )

        if not ai_output.radio_operations:
            return ChatMessageResponse(
                message_id=msg_id, conversation_id=conv_id, timestamp=timestamp,
                text=f"Please specify the radio chipset and quantity (e.g. 'two Intel AX210 radios for {tag}')."
            )

        rad_op = ai_output.radio_operations[0]
        payload = {
            "intent": "radio_configuration_update",
            "category": "lanforge",
            "equipment_id": item["id"],
            "equipment_tag": tag,
            "chipset": rad_op.chipset,
            "quantity": rad_op.quantity,
            "operation": rad_op.operation,
            "performed_by": user.full_name
        }
        token = confirmation_service.create_confirmation_token(action_id, payload)

        existing_rad = next((r for r in item.get("radios", []) if r["chipset"].lower() == rad_op.chipset.lower()), None)
        prev_qty = existing_rad["quantity"] if existing_rad else 0

        preview = ActionPreviewDTO(
            id=action_id,
            intent=intent,
            category="lanforge",
            record_identifier=tag,
            title=f"Update LANforge Radios: {tag}",
            description=f"Configure {rad_op.chipset} radio hardware interface.",
            changes=[
                FieldChangeDTO(field=f"{rad_op.chipset} Quantity", from_value=prev_qty, to_value=rad_op.quantity),
            ],
            requires_confirmation=True,
            confirmation_token=token,
            payload=payload
        )

        return ChatMessageResponse(
            message_id=msg_id, conversation_id=conv_id, timestamp=timestamp,
            text=f"Verified hardware radio patch for {tag}. Please review and confirm the change:",
            action_preview=preview
        )

    # E. Intent: Status Update (e.g. Under Maintenance)
    if intent == "status_update":
        target_status = ai_output.target_status
        if not target_status:
            return ChatMessageResponse(
                message_id=msg_id, conversation_id=conv_id, timestamp=timestamp,
                text="Please specify the target status: Available, In-Use, or Under Maintenance."
            )

        payload = {
            "intent": "status_update",
            "category": cat,
            "equipment_id": item["id"],
            "equipment_tag": tag,
            "target_status": target_status,
            "performed_by": user.full_name
        }
        token = confirmation_service.create_confirmation_token(action_id, payload)

        preview = ActionPreviewDTO(
            id=action_id,
            intent=intent,
            category=cat,
            record_identifier=tag,
            title=f"Shift Status: {tag}",
            description=f"Update operational state to {target_status}.",
            changes=[
                FieldChangeDTO(field="Status", from_value=item["status"], to_value=target_status),
            ],
            requires_confirmation=True,
            confirmation_token=token,
            payload=payload
        )

        return ChatMessageResponse(
            message_id=msg_id, conversation_id=conv_id, timestamp=timestamp,
            text=f"Prepared status update for {tag} to '{target_status}'. Please confirm:",
            action_preview=preview
        )

    # F. Intent: Location Relocation (e.g. "Change CT521A location to OPEL")
    if intent == "location_update":
        target_loc = ai_output.location
        if not target_loc:
            return ChatMessageResponse(
                message_id=msg_id, conversation_id=conv_id, timestamp=timestamp,
                text="Please specify the target facility location: VINSR, OPEL, or GVP."
            )

        payload = {
            "intent": "location_update",
            "category": cat,
            "equipment_id": item["id"],
            "equipment_tag": tag,
            "location": target_loc,
            "performed_by": user.full_name
        }
        token = confirmation_service.create_confirmation_token(action_id, payload)

        preview = ActionPreviewDTO(
            id=action_id,
            intent=intent,
            category=cat,
            record_identifier=tag,
            title=f"Relocate Equipment: {tag}",
            description=f"Transfer physical testbed location to {target_loc} lab facility.",
            changes=[
                FieldChangeDTO(field="Location", from_value=item.get("location") or "VINSR", to_value=target_loc),
            ],
            requires_confirmation=True,
            confirmation_token=token,
            payload=payload
        )

        return ChatMessageResponse(
            message_id=msg_id, conversation_id=conv_id, timestamp=timestamp,
            text=f"Prepared location update for {tag} to facility '{target_loc}'. Please confirm:",
            action_preview=preview
        )

    # G. Intent: Model Specification Update (e.g. "Update the model of MOB001")
    if intent == "model_update":
        curr_model = item.get("model") or item.get("lanforge_model") or item.get("chamber_type") or "Standard"
        payload = {
            "intent": "model_update",
            "category": cat,
            "equipment_id": item["id"],
            "equipment_tag": tag,
            "performed_by": user.full_name
        }
        token = confirmation_service.create_confirmation_token(action_id, payload)

        preview = ActionPreviewDTO(
            id=action_id,
            intent=intent,
            category=cat,
            record_identifier=tag,
            title=f"Update Specification Model: {tag}",
            description=f"Update hardware specification profile for {tag}.",
            changes=[
                FieldChangeDTO(field="Hardware Model", from_value=curr_model, to_value="Updated Model Profile"),
            ],
            requires_confirmation=True,
            confirmation_token=token,
            payload=payload
        )

        return ChatMessageResponse(
            message_id=msg_id, conversation_id=conv_id, timestamp=timestamp,
            text=f"Prepared model update for {tag} (Current: {curr_model}). Please confirm:",
            action_preview=preview
        )

    # Fallback response
    return ChatMessageResponse(
        message_id=msg_id, conversation_id=conv_id, timestamp=timestamp,
        text=f"Acknowledged: '{text}'. I am monitoring Candela's inventory. You can query units (e.g. LF-521B-001), request allocations, or update radio configurations."
    )
