import re
from typing import Dict, Any, Optional, List

class EntityExtractor:
    @staticmethod
    def extract_identifiers(text: str) -> Dict[str, Any]:
        result = {}
        # 1. Match LANforge IDs (e.g. LF-521B-001, CT521B, CT521A, LF-523C-002, CT525)
        lf_match = re.search(r'\b(LF-[A-Za-z0-9-]+|CT\d{3}[A-Za-z0-9]*)\b', text, re.IGNORECASE)
        if lf_match:
            result["record_identifier"] = lf_match.group(1).upper()
            result["category"] = "lanforge"

        # 2. Match Desktop IDs (e.g. DT-DELL-01, DESK001, DT-HP-02, DESK-\d+)
        dt_match = re.search(r'\b(DT-[A-Za-z0-9-]+|DESK\d+|DESK-[A-Za-z0-9-]+)\b', text, re.IGNORECASE)
        if dt_match:
            result["record_identifier"] = dt_match.group(1).upper()
            result["category"] = "desktop"

        # 3. Match Mobile IDs (e.g. MOB-PIXEL-01, MOB-SAMS-02, MOB001, MOB002, MOB-\d+)
        mob_match = re.search(r'\b(MOB-[A-Za-z0-9-]+|MOB\d+|PIXEL\s*9|GALAXY\s*S24)\b', text, re.IGNORECASE)
        if mob_match and "record_identifier" not in result:
            result["record_identifier"] = mob_match.group(1).upper()
            result["category"] = "mobile"

        # 4. Match Chamber IDs (e.g. CH-ISO-01, CH-OTA-02, Chamber 03, Chamber 3)
        ch_match = re.search(r'\b(CH-[A-Za-z0-9-]+|Chamber\s*0?\d+)\b', text, re.IGNORECASE)
        if ch_match and "record_identifier" not in result:
            matched_val = ch_match.group(1)
            result["record_identifier"] = matched_val
            result["category"] = "chamber"

        # Explicit category keywords if no ID found
        if "category" not in result:
            text_lower = text.lower()
            if "lanforge" in text_lower or "testbed" in text_lower or "ct52" in text_lower:
                result["category"] = "lanforge"
            elif "desktop" in text_lower or "workstation" in text_lower or "tower" in text_lower:
                result["category"] = "desktop"
            elif "mobile" in text_lower or "phone" in text_lower or "pixel" in text_lower or "galaxy" in text_lower:
                result["category"] = "mobile"
            elif "chamber" in text_lower or "anechoic" in text_lower or "rf isolation" in text_lower:
                result["category"] = "chamber"

        return result

    @staticmethod
    def extract_employee_name(text: str) -> Optional[str]:
        # Known employees or pattern "to <Name>" / "by <Name>" / "used by <Name>"
        known = [
            "fayaz ahmed", "fayaz", "sarah chen", "sarah", "elena rostova", "elena", 
            "alex mercer", "alex", "mark vance", "rahul verma", "rahul", 
            "priya sharma", "priya", "sneha patel", "sneha"
        ]
        text_lower = text.lower()
        for k in known:
            if re.search(rf'\b{k}\b', text_lower):
                if "fayaz" in k: return "Fayaz Ahmed"
                if "sarah" in k: return "Sarah Chen"
                if "elena" in k: return "Elena Rostova"
                if "alex" in k: return "Alex Mercer"
                if "mark" in k: return "Mark Vance"
                if "rahul" in k: return "Rahul Verma"
                if "priya" in k: return "Priya Sharma"
                if "sneha" in k: return "Sneha Patel"

        m = re.search(r'(?:to|by|for|under|assigned to|custodian)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)', text)
        if m:
            return m.group(1).strip()
        return None

    @staticmethod
    def extract_location(text: str) -> Optional[str]:
        for loc in ["VINSR", "OPEL", "GVP"]:
            if re.search(rf'\b{loc}\b', text, re.IGNORECASE):
                return loc
        return None

    @staticmethod
    def extract_status(text: str) -> Optional[str]:
        text_lower = text.lower()
        if "maintenance" in text_lower or "diagnostic" in text_lower or "repair" in text_lower:
            return "Under Maintenance"
        if "available" in text_lower or "in stock" in text_lower or "unassigned" in text_lower:
            return "Available"
        if "in-use" in text_lower or "in use" in text_lower or "assigned" in text_lower:
            return "In-Use"
        return None

    @staticmethod
    def extract_radio_operations(text: str) -> List[Dict[str, Any]]:
        ops = []
        # Pattern: "<number> <Chipset> radios" e.g., "two Intel AX210 radios" or "2x Qualcomm QCN9274"
        word_to_num = {"one": 1, "two": 2, "three": 3, "four": 4, "five": 5, "six": 6}
        
        chipset_match = re.search(r'(intel\s+ax210|qualcomm\s+qcn9274|broadcom\s+bcm4375|mediatek\s+mt7922)', text, re.IGNORECASE)
        qty_match = re.search(r'\b(\d+|one|two|three|four)\s*(?:x|radios?|interfaces?)?\b', text, re.IGNORECASE)

        if chipset_match:
            raw_chip = chipset_match.group(1).title()
            if "ax210" in raw_chip.lower(): raw_chip = "Intel AX210"
            if "qcn9274" in raw_chip.lower(): raw_chip = "Qualcomm QCN9274"
            if "bcm4375" in raw_chip.lower(): raw_chip = "Broadcom BCM4375"

            qty = 1
            if qty_match:
                q_val = qty_match.group(1).lower()
                qty = word_to_num.get(q_val, int(q_val) if q_val.isdigit() else 1)

            op_type = "remove" if "remove" in text.lower() or "delete" in text.lower() else "set_quantity"
            ops.append({"operation": op_type, "chipset": raw_chip, "quantity": qty})

        return ops

entity_extractor = EntityExtractor()
