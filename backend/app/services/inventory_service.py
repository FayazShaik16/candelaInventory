from typing import List, Optional, Dict, Any
from copy import deepcopy
import re

# Comprehensive in-memory repository initialized with verified seeds
INITIAL_LANFORGES = [
    {
        "id": "lf-01",
        "s_no": 1,
        "location": "VINSR",
        "testbed_ip": "192.168.1.101",
        "project": "Wi-Fi 6E High-Density AP Stress",
        "poc_id": "usr-emp-01",
        "poc_name": "Fayaz Ahmed",
        "lanforge_id": "LF-521B-001",
        "lanforge_model": "LANforge CT521B",
        "max_ethernet_speed": "10 Gbps",
        "total_clients": 128,
        "no_of_11be_clients": 0,
        "no_of_11ax_clients": 96,
        "no_of_11ac_clients": 24,
        "no_of_11n_clients": 8,
        "status": "In-Use",
        "comments": "Configured for dual 5 GHz 160MHz channel bonding stress test matrix.",
        "previously_used_by": ["Sarah Chen"],
        "radios": [
            {"id": "rad-01", "chipset": "Qualcomm QCN9274", "quantity": 2},
            {"id": "rad-02", "chipset": "Broadcom BCM4375", "quantity": 1}
        ],
        "is_archived": False
    },
    {
        "id": "lf-02",
        "s_no": 2,
        "location": "OPEL",
        "testbed_ip": "192.168.1.102",
        "project": "Automated 11be Multi-Link Benchmark",
        "poc_id": None,
        "poc_name": "Unassigned",
        "lanforge_id": "LF-523C-002",
        "lanforge_model": "LANforge CT523c",
        "max_ethernet_speed": "25 Gbps",
        "total_clients": 64,
        "no_of_11be_clients": 32,
        "no_of_11ax_clients": 32,
        "no_of_11ac_clients": 0,
        "no_of_11n_clients": 0,
        "status": "Available",
        "comments": "Wi-Fi 7 testbed ready for immediate project assignment.",
        "previously_used_by": ["Elena Rostova"],
        "radios": [
            {"id": "rad-03", "chipset": "Qualcomm QCN9274", "quantity": 4}
        ],
        "is_archived": False
    },
    {
        "id": "lf-03",
        "s_no": 3,
        "location": "VINSR",
        "testbed_ip": "192.168.1.103",
        "project": "Legacy 802.11ac Fallback Validation",
        "poc_id": None,
        "poc_name": "Unassigned",
        "lanforge_id": "LF-521A-003",
        "lanforge_model": "LANforge CT521A",
        "max_ethernet_speed": "1 Gbps",
        "total_clients": 32,
        "no_of_11be_clients": 0,
        "no_of_11ax_clients": 0,
        "no_of_11ac_clients": 32,
        "no_of_11n_clients": 0,
        "status": "Under Maintenance",
        "comments": "Ethernet interface port eth1 reporting link flap issues.",
        "previously_used_by": ["Fayaz Ahmed"],
        "radios": [
            {"id": "rad-04", "chipset": "Intel AX210", "quantity": 1}
        ],
        "is_archived": False
    }
]

INITIAL_DESKTOPS = [
    {
        "id": "dt-01",
        "s_no": 1,
        "device_id": "DT-DELL-01",
        "device_brand": "Dell",
        "model": "Precision 7960 Tower",
        "project": "Continuous Controller Automation",
        "poc_id": "usr-emp-01",
        "poc_name": "Fayaz Ahmed",
        "status": "In-Use",
        "is_archived": False
    },
    {
        "id": "dt-02",
        "s_no": 2,
        "device_id": "DT-HP-02",
        "device_brand": "HP",
        "model": "Z4 G5 Workstation",
        "project": "Lab Automation Master",
        "poc_id": None,
        "poc_name": "Unassigned",
        "status": "Available",
        "is_archived": False
    },
    {
        "id": "dt-03",
        "s_no": 3,
        "device_id": "DT-LEN-03",
        "device_brand": "Lenovo",
        "model": "ThinkStation P620",
        "project": "Thermal AP Run",
        "poc_id": None,
        "poc_name": "Unassigned",
        "status": "Available",
        "is_archived": False
    }
]

INITIAL_MOBILES = [
    {
        "id": "mb-01",
        "s_no": 1,
        "device_id": "MOB-PIXEL-01",
        "device_brand": "Google",
        "model": "Pixel 9 Pro",
        "project": "Mobile Fleet Multi-Station Roaming Suite",
        "poc_id": "usr-emp-02",
        "poc_name": "Sarah Chen",
        "status": "In-Use",
        "is_archived": False
    },
    {
        "id": "mb-02",
        "s_no": 2,
        "device_id": "MOB-SAMS-02",
        "device_brand": "Samsung",
        "model": "Galaxy S24 Ultra",
        "project": "Wi-Fi 7 Client Station Benchmark",
        "poc_id": "usr-emp-01",
        "poc_name": "Fayaz Ahmed",
        "status": "In-Use",
        "is_archived": False
    },
    {
        "id": "mb-03",
        "s_no": 3,
        "device_id": "MOB-APPL-03",
        "device_brand": "Apple",
        "model": "iPhone 16 Pro",
        "project": "Fast BSS Transition (802.11r)",
        "poc_id": None,
        "poc_name": "Unassigned",
        "status": "Available",
        "is_archived": False
    },
    {
        "id": "mb-04",
        "s_no": 4,
        "device_id": "MOB-ONEP-04",
        "device_brand": "OnePlus",
        "model": "OnePlus 12",
        "project": "Multi-Client Association Scaling",
        "poc_id": None,
        "poc_name": "Unassigned",
        "status": "Available",
        "is_archived": False
    },
    {
        "id": "mb-05",
        "s_no": 5,
        "device_id": "MOB-PIXEL-05",
        "device_brand": "Google",
        "model": "Pixel 8a",
        "project": "Legacy 802.11ax Interop Lab",
        "poc_id": "usr-emp-04",
        "poc_name": "Rahul Verma",
        "status": "Under Maintenance",
        "is_archived": False
    }
]

INITIAL_CHAMBERS = [
    {
        "id": "ch-01",
        "s_no": 1,
        "chamber_type": "RF Isolation Chamber",
        "chamber_id": "CH-ISO-01",
        "used_by_id": "usr-emp-01",
        "used_by_name": "Fayaz Ahmed",
        "project": "Wi-Fi 6E High-Throughput RF Isolation",
        "status": "In-Use",
        "is_archived": False
    },
    {
        "id": "ch-02",
        "s_no": 2,
        "chamber_type": "Over-The-Air Chamber (OTA)",
        "chamber_id": "CH-OTA-02",
        "used_by_id": "usr-emp-02",
        "used_by_name": "Sarah Chen",
        "project": "Antenna Characterization",
        "status": "In-Use",
        "is_archived": False
    },
    {
        "id": "ch-03",
        "s_no": 3,
        "chamber_type": "Walk-In Anechoic Chamber",
        "chamber_id": "CH-ANE-03",
        "used_by_id": None,
        "used_by_name": "Unassigned",
        "project": "Large-Scale Multi-AP Roaming Arena",
        "status": "Available",
        "is_archived": False
    },
    {
        "id": "ch-04",
        "s_no": 4,
        "chamber_type": "Reverberation Chamber",
        "chamber_id": "CH-REV-04",
        "used_by_id": None,
        "used_by_name": "Unassigned",
        "project": "Multipath Delay Spread Simulation",
        "status": "Under Maintenance",
        "is_archived": False
    }
]

INITIAL_EMPLOYEES = [
    {"id": "usr-admin-01", "full_name": "Alex Mercer", "email": "alex.mercer@candelatech.com", "role": "admin", "account_status": "active"},
    {"id": "usr-emp-01", "full_name": "Fayaz Ahmed", "email": "fayaz.ahmed@candelatech.com", "role": "employee", "account_status": "active"},
    {"id": "usr-emp-02", "full_name": "Sarah Chen", "email": "sarah.chen@candelatech.com", "role": "employee", "account_status": "active"},
    {"id": "usr-emp-03", "full_name": "Elena Rostova", "email": "elena.r@candelatech.com", "role": "employee", "account_status": "active"},
    {"id": "usr-emp-04", "full_name": "Rahul Verma", "email": "rahul.v@candelatech.com", "role": "employee", "account_status": "active"},
    {"id": "usr-emp-05", "full_name": "Priya Sharma", "email": "priya.s@candelatech.com", "role": "employee", "account_status": "active"},
    {"id": "usr-emp-06", "full_name": "Sneha Patel", "email": "sneha.p@candelatech.com", "role": "employee", "account_status": "active"},
    {"id": "usr-emp-inactive", "full_name": "Mark Vance", "email": "mark.v@candelatech.com", "role": "employee", "account_status": "inactive"}
]

class InventoryRepository:
    def __init__(self):
        self.lanforges = deepcopy(INITIAL_LANFORGES)
        self.desktops = deepcopy(INITIAL_DESKTOPS)
        self.mobiles = deepcopy(INITIAL_MOBILES)
        self.chambers = deepcopy(INITIAL_CHAMBERS)
        self.employees = deepcopy(INITIAL_EMPLOYEES)

    def find_lanforge(self, identifier: str) -> Optional[Dict[str, Any]]:
        id_clean = identifier.lower().replace("-", "").replace(" ", "").replace("_", "")
        # Pass 1: exact tag / model match
        for lf in self.lanforges:
            tag_clean = lf["lanforge_id"].lower().replace("-", "").replace(" ", "").replace("_", "")
            model_clean = lf["lanforge_model"].lower().replace("-", "").replace(" ", "").replace("_", "")
            if tag_clean == id_clean or id_clean in tag_clean or id_clean in model_clean or lf["id"].lower() == identifier.lower():
                return lf

        # Pass 2: numeric heuristic fallback
        digits = re.findall(r'\d+', identifier)
        last_num = int(digits[-1]) if digits else None
        if last_num is not None:
            for lf in self.lanforges:
                if lf["s_no"] == last_num or lf["lanforge_id"].endswith(str(last_num)) or f"{last_num:03d}" in lf["lanforge_id"]:
                    return lf
        return None

    def find_desktop(self, identifier: str) -> Optional[Dict[str, Any]]:
        id_clean = identifier.lower().replace("-", "").replace(" ", "").replace("_", "")
        # Pass 1: exact tag / model match
        for dt in self.desktops:
            tag_clean = dt["device_id"].lower().replace("-", "").replace(" ", "").replace("_", "")
            if tag_clean == id_clean or id_clean in tag_clean or dt["id"].lower() == identifier.lower():
                return dt

        # Pass 2: numeric heuristic fallback
        digits = re.findall(r'\d+', identifier)
        last_num = int(digits[-1]) if digits else None
        if last_num is not None:
            for dt in self.desktops:
                if dt["s_no"] == last_num or dt["device_id"].endswith(str(last_num)) or f"{last_num:02d}" in dt["device_id"]:
                    return dt
        return None

    def find_mobile(self, identifier: str) -> Optional[Dict[str, Any]]:
        id_clean = identifier.lower().replace("-", "").replace(" ", "").replace("_", "")
        # Pass 1: exact tag / model match
        for mb in self.mobiles:
            tag_clean = mb["device_id"].lower().replace("-", "").replace(" ", "").replace("_", "")
            model_clean = mb["model"].lower().replace("-", "").replace(" ", "").replace("_", "")
            if tag_clean == id_clean or id_clean in tag_clean or id_clean in model_clean or mb["id"].lower() == identifier.lower():
                return mb

        # Pass 2: numeric heuristic fallback
        digits = re.findall(r'\d+', identifier)
        last_num = int(digits[-1]) if digits else None
        if last_num is not None:
            for mb in self.mobiles:
                if mb["s_no"] == last_num or mb["device_id"].endswith(str(last_num)) or f"{last_num:02d}" in mb["device_id"]:
                    return mb
        return None

    def find_chamber(self, identifier: str) -> Optional[Dict[str, Any]]:
        id_clean = identifier.lower().replace("-", "").replace(" ", "").replace("_", "")
        # Pass 1: exact tag / model match
        for ch in self.chambers:
            tag_clean = ch["chamber_id"].lower().replace("-", "").replace(" ", "").replace("_", "")
            if tag_clean == id_clean or id_clean in tag_clean or ch["id"].lower() == identifier.lower():
                return ch

        # Pass 2: numeric heuristic fallback
        digits = re.findall(r'\d+', identifier)
        last_num = int(digits[-1]) if digits else None
        if last_num is not None:
            for ch in self.chambers:
                if ch["s_no"] == last_num or ch["chamber_id"].endswith(str(last_num)) or f"{last_num:02d}" in ch["chamber_id"]:
                    return ch
        return None

    def find_employee(self, name_or_id: str) -> Optional[Dict[str, Any]]:
        target = name_or_id.lower().strip()
        for emp in self.employees:
            if emp["id"].lower() == target or emp["full_name"].lower() == target or target in emp["full_name"].lower():
                return emp
        return None

    def update_lanforge_radios(self, lanforge_id: str, chipset: str, quantity: int, operation: str = "set_quantity"):
        lf = self.find_lanforge(lanforge_id)
        if not lf:
            return False
        
        radios = lf.get("radios", [])
        existing = next((r for r in radios if r["chipset"].lower() == chipset.lower()), None)

        if operation == "remove":
            lf["radios"] = [r for r in radios if r["chipset"].lower() != chipset.lower()]
        elif existing:
            if operation == "add":
                existing["quantity"] += quantity
            else:
                existing["quantity"] = quantity
        else:
            radios.append({"id": f"rad-{len(radios)+1}", "chipset": chipset, "quantity": quantity})
            lf["radios"] = radios
        return True

repo = InventoryRepository()
