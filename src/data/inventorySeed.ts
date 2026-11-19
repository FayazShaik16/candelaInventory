import { 
  LANforgeItem, 
  DesktopItem, 
  MobileItem, 
  ChamberItem, 
  EquipmentAssignment,
  ActivityLog,
  AIAssistantMessage 
} from '@/types/inventory';

export const INITIAL_AI_MESSAGES: AIAssistantMessage[] = [
  {
    id: 'ai-init-1',
    sender: 'assistant',
    timestamp: '2026-11-19T10:00:00Z',
    text: 'Hello! I am your Candela Inventory AI Assistant. How can I help you manage your testbeds, chambers, and lab assignments today?',
  },
];

export const INITIAL_ASSIGNMENTS: EquipmentAssignment[] = [
  {
    "id": "a6bd4425-d9f7-442d-98c9-9715d0374402",
    "equipmentCategory": "lanforge",
    "equipmentId": "15d0eeb0-316d-4c20-be71-7e5d2919e703",
    "equipmentTag": "LF-OPEL-523C-01",
    "employeeId": "db40b5f4-cf6c-4434-9464-af5ce25fd6af",
    "employeeName": "Sirisha",
    "employeeEmail": "sirisha@candelatech.com",
    "assignedDate": "2026-11-19T10:25:36.63825+00:00",
    "returnDate": null,
    "assignedBy": "Admin Supervisor",
    "notes": "Assigned for project Netgear",
    "status": "active"
  },
  {
    "id": "867e928d-32c6-45da-b540-34eaece8753e",
    "equipmentCategory": "lanforge",
    "equipmentId": "1e719436-49ce-4759-8044-ea6e74db210f",
    "equipmentTag": "LF-OPEL-523C-02",
    "employeeId": "db40b5f4-cf6c-4434-9464-af5ce25fd6af",
    "employeeName": "Sirisha",
    "employeeEmail": "sirisha@candelatech.com",
    "assignedDate": "2026-11-19T10:25:37.123575+00:00",
    "returnDate": null,
    "assignedBy": "Admin Supervisor",
    "notes": "Assigned for project Netgear",
    "status": "active"
  },
  {
    "id": "f57660bb-f0f3-403d-b5a9-d56750484d36",
    "equipmentCategory": "lanforge",
    "equipmentId": "2c1c1181-c573-4a42-891d-1c7394c69646",
    "equipmentTag": "LF-OPEL-523C-04",
    "employeeId": "b0c3330e-bffb-440f-a2dc-5353ea879e2b",
    "employeeName": "Tejas",
    "employeeEmail": "tejas@candelatech.com",
    "assignedDate": "2026-11-19T10:25:38.249862+00:00",
    "returnDate": null,
    "assignedBy": "Admin Supervisor",
    "notes": "Assigned for project Netgear",
    "status": "active"
  },
  {
    "id": "8a9d702a-f802-4418-83c9-3be2edb42312",
    "equipmentCategory": "lanforge",
    "equipmentId": "8479422f-81cf-46aa-aa2f-796e79182d08",
    "equipmentTag": "ct523-6e08",
    "employeeId": "739c95a7-f922-4322-b37d-2f281a7d922c",
    "employeeName": "Deepika",
    "employeeEmail": "deepika@candelatech.com",
    "assignedDate": "2026-11-19T10:25:38.884464+00:00",
    "returnDate": null,
    "assignedBy": "Admin Supervisor",
    "notes": "Assigned for project PM Team",
    "status": "active"
  },
  {
    "id": "c4627998-82ae-4e87-aecf-06468966fc03",
    "equipmentCategory": "lanforge",
    "equipmentId": "453b821e-a93d-48c4-a2e1-0cd216e79a8f",
    "equipmentTag": "LF-OPEL-523C-05",
    "employeeId": "6513cf3b-1737-4ffe-aa45-047be56ee2fe",
    "employeeName": "Shyamala",
    "employeeEmail": "shyamala@candelatech.com",
    "assignedDate": "2026-11-19T10:25:39.684542+00:00",
    "returnDate": null,
    "assignedBy": "Admin Supervisor",
    "notes": "Assigned for project Netgear",
    "status": "active"
  },
  {
    "id": "25f8acf8-172f-4b0c-9b87-199e123a2e17",
    "equipmentCategory": "lanforge",
    "equipmentId": "6bc0f7ac-2d0f-4085-b813-fd653901c2f1",
    "equipmentTag": "LF-OPEL-523C-06",
    "employeeId": "6513cf3b-1737-4ffe-aa45-047be56ee2fe",
    "employeeName": "Shyamala",
    "employeeEmail": "shyamala@candelatech.com",
    "assignedDate": "2026-11-19T10:25:40.952276+00:00",
    "returnDate": null,
    "assignedBy": "Admin Supervisor",
    "notes": "Assigned for project Netgear",
    "status": "active"
  },
  {
    "id": "62ec0cac-5854-4854-8108-c73bc8295339",
    "equipmentCategory": "lanforge",
    "equipmentId": "f8e26e8b-2941-447c-831c-2298e618517b",
    "equipmentTag": "LF-GVP-523C-01",
    "employeeId": "2e2c0e82-dc2f-4034-b5d6-ae30cd96a13c",
    "employeeName": "Pranathi",
    "employeeEmail": "pranathi@candelatech.com",
    "assignedDate": "2026-11-19T10:25:41.899799+00:00",
    "returnDate": null,
    "assignedBy": "Admin Supervisor",
    "notes": "Assigned for project Chamberlain",
    "status": "active"
  },
  {
    "id": "ea9c3e7c-66b8-456f-b5e0-961441f95b5c",
    "equipmentCategory": "lanforge",
    "equipmentId": "cb0754db-e594-4100-b008-7d15bb082521",
    "equipmentTag": "LF-VINSR-523C-01",
    "employeeId": "46bd1939-c02b-4d3f-9a92-142e45a80b89",
    "employeeName": "Lokesh",
    "employeeEmail": "lokesh@candelatech.com",
    "assignedDate": "2026-11-19T10:25:42.862439+00:00",
    "returnDate": null,
    "assignedBy": "Admin Supervisor",
    "notes": "Assigned for project Jio",
    "status": "active"
  },
  {
    "id": "f3b1b344-7673-419f-b2ab-1ec013df26e0",
    "equipmentCategory": "lanforge",
    "equipmentId": "876269d4-d63e-4568-8036-59a36e910921",
    "equipmentTag": "LF-GVP-523C-02",
    "employeeId": "87fb10cc-42cd-4e2a-aade-3ab578074cc4",
    "employeeName": "Aarif",
    "employeeEmail": "aarif@candelatech.com",
    "assignedDate": "2026-11-19T10:25:44.007927+00:00",
    "returnDate": null,
    "assignedBy": "Admin Supervisor",
    "notes": "Assigned for project SpaceX",
    "status": "active"
  },
  {
    "id": "1121d833-f904-4877-a7f4-5fac57315031",
    "equipmentCategory": "lanforge",
    "equipmentId": "1d5f340d-9c9c-4bd1-858a-140026dce9ec",
    "equipmentTag": "LF-GVP-523C-03",
    "employeeId": "a0122097-4c9e-4e87-a7f8-056edcd30957",
    "employeeName": "Venkat",
    "employeeEmail": "venkat@candelatech.com",
    "assignedDate": "2026-11-19T10:25:44.49338+00:00",
    "returnDate": null,
    "assignedBy": "Admin Supervisor",
    "notes": "Assigned for project SpaceX",
    "status": "active"
  },
  {
    "id": "3e55d16d-dadb-4127-bbe1-59ad9bc8496b",
    "equipmentCategory": "lanforge",
    "equipmentId": "df3db043-aa6b-4514-814b-3574ca6ccbe0",
    "equipmentTag": "LF-PRIMA-523C-01",
    "employeeId": "57c730b5-26a3-4657-8455-41692b75770a",
    "employeeName": "Bindu",
    "employeeEmail": "bindu@candelatech.com",
    "assignedDate": "2026-11-19T10:25:45.336141+00:00",
    "returnDate": null,
    "assignedBy": "Admin Supervisor",
    "notes": "Assigned for project GX",
    "status": "active"
  },
  {
    "id": "de6a5afd-9392-4b54-9ce7-5def98d3a301",
    "equipmentCategory": "lanforge",
    "equipmentId": "58f9ead1-b699-45e7-b781-e8a381aa0a4d",
    "equipmentTag": "CT523c-6e06",
    "employeeId": "a65777b2-7fa8-43be-af63-2f4cd49184d9",
    "employeeName": "Chaitanya",
    "employeeEmail": "chaitanya@candelatech.com",
    "assignedDate": "2026-11-19T10:25:46.149454+00:00",
    "returnDate": null,
    "assignedBy": "Admin Supervisor",
    "notes": "Assigned for project Netgear",
    "status": "active"
  },
  {
    "id": "45b56dba-7ab4-4dd0-bc6b-9d193b9c2dde",
    "equipmentCategory": "lanforge",
    "equipmentId": "ec8a1c41-bd6b-4b33-b5fe-100f30a92e7f",
    "equipmentTag": "LF-523B-02",
    "employeeId": "db40b5f4-cf6c-4434-9464-af5ce25fd6af",
    "employeeName": "Sirisha",
    "employeeEmail": "sirisha@candelatech.com",
    "assignedDate": "2026-11-19T10:25:47.605696+00:00",
    "returnDate": null,
    "assignedBy": "Admin Supervisor",
    "notes": "Assigned for project Netgear",
    "status": "active"
  },
  {
    "id": "35df4327-eec9-4f55-a8f5-785d4ea1347d",
    "equipmentCategory": "lanforge",
    "equipmentId": "61ce76f4-bfe0-434d-986c-f6ec9464384b",
    "equipmentTag": "LF-521C-01",
    "employeeId": "6513cf3b-1737-4ffe-aa45-047be56ee2fe",
    "employeeName": "Shyamala",
    "employeeEmail": "shyamala@candelatech.com",
    "assignedDate": "2026-11-19T10:25:48.416581+00:00",
    "returnDate": null,
    "assignedBy": "Admin Supervisor",
    "notes": "Assigned for project Netgear",
    "status": "active"
  },
  {
    "id": "79c0a85d-af41-4970-9b9f-72f78e339f64",
    "equipmentCategory": "lanforge",
    "equipmentId": "a0f06652-f53e-4fb7-bf74-f007c2bda850",
    "equipmentTag": "LF-521A-02",
    "employeeId": "a0122097-4c9e-4e87-a7f8-056edcd30957",
    "employeeName": "Venkat",
    "employeeEmail": "venkat@candelatech.com",
    "assignedDate": "2026-11-19T10:25:49.240508+00:00",
    "returnDate": null,
    "assignedBy": "Admin Supervisor",
    "notes": "Assigned for project Hotwire",
    "status": "active"
  },
  {
    "id": "7310a5de-6046-439e-8be3-4f1710f4dfcc",
    "equipmentCategory": "lanforge",
    "equipmentId": "5072b332-963f-4245-ba32-7a31808438a1",
    "equipmentTag": "LF-521A-04",
    "employeeId": "87fb10cc-42cd-4e2a-aade-3ab578074cc4",
    "employeeName": "Aarif",
    "employeeEmail": "aarif@candelatech.com",
    "assignedDate": "2026-11-19T10:25:50.310485+00:00",
    "returnDate": null,
    "assignedBy": "Admin Supervisor",
    "notes": "Assigned for project SpaceX",
    "status": "active"
  },
  {
    "id": "f91bb652-ef29-403e-bd42-ec4f3eeea13c",
    "equipmentCategory": "lanforge",
    "equipmentId": "1b2baa41-c07a-4ee9-bd97-d399d366e388",
    "equipmentTag": "LF-521A-07",
    "employeeId": "a0122097-4c9e-4e87-a7f8-056edcd30957",
    "employeeName": "Venkat",
    "employeeEmail": "venkat@candelatech.com",
    "assignedDate": "2026-11-19T10:25:51.765801+00:00",
    "returnDate": null,
    "assignedBy": "Admin Supervisor",
    "notes": "Assigned for project Hotwire",
    "status": "active"
  },
  {
    "id": "67baebab-1479-45c8-92e3-23961efa02ea",
    "equipmentCategory": "lanforge",
    "equipmentId": "f6794262-e976-4fbb-bb8c-2b3fece84793",
    "equipmentTag": "LF-521A-08",
    "employeeId": "a0122097-4c9e-4e87-a7f8-056edcd30957",
    "employeeName": "Venkat",
    "employeeEmail": "venkat@candelatech.com",
    "assignedDate": "2026-11-19T10:25:52.242535+00:00",
    "returnDate": null,
    "assignedBy": "Admin Supervisor",
    "notes": "Assigned for project Hotwire",
    "status": "active"
  },
  {
    "id": "3b3ef601-8a73-465c-9941-a4016091e422",
    "equipmentCategory": "mobile",
    "equipmentId": "ffb70aa1-f3c9-4646-b66b-ac90c3c42dde",
    "equipmentTag": "MOB-SAM-S25-EERO",
    "employeeId": "db40b5f4-cf6c-4434-9464-af5ce25fd6af",
    "employeeName": "Sirisha",
    "employeeEmail": "sirisha@candelatech.com",
    "assignedDate": "2026-11-19T10:25:52.878866+00:00",
    "returnDate": null,
    "assignedBy": "Admin Supervisor",
    "notes": "Assigned for project Netgear",
    "status": "active"
  },
  {
    "id": "23688a71-e9ef-4e78-9330-db2038726296",
    "equipmentCategory": "mobile",
    "equipmentId": "75367a4a-2bb0-4129-aef0-b2734e120897",
    "equipmentTag": "MOB-OP-11-EERO",
    "employeeId": "db40b5f4-cf6c-4434-9464-af5ce25fd6af",
    "employeeName": "Sirisha",
    "employeeEmail": "sirisha@candelatech.com",
    "assignedDate": "2026-11-19T10:25:53.542799+00:00",
    "returnDate": null,
    "assignedBy": "Admin Supervisor",
    "notes": "Assigned for project Netgear",
    "status": "active"
  },
  {
    "id": "9709d0ee-4441-4754-ad0b-a4037517bf6d",
    "equipmentCategory": "mobile",
    "equipmentId": "771e5de4-cb7a-476f-98b6-d3023756365d",
    "equipmentTag": "MOB-PIXEL-8-EERO",
    "employeeId": "db40b5f4-cf6c-4434-9464-af5ce25fd6af",
    "employeeName": "Sirisha",
    "employeeEmail": "sirisha@candelatech.com",
    "assignedDate": "2026-11-19T10:25:54.275478+00:00",
    "returnDate": null,
    "assignedBy": "Admin Supervisor",
    "notes": "Assigned for project Netgear",
    "status": "active"
  },
  {
    "id": "c71126d3-8f72-4d44-9a21-822960bb60c1",
    "equipmentCategory": "mobile",
    "equipmentId": "000763d2-1d46-4ec4-8c04-10f939b99981",
    "equipmentTag": "MOB-HONOR-9X-01",
    "employeeId": "87fb10cc-42cd-4e2a-aade-3ab578074cc4",
    "employeeName": "Aarif",
    "employeeEmail": "aarif@candelatech.com",
    "assignedDate": "2026-11-19T10:25:54.793443+00:00",
    "returnDate": null,
    "assignedBy": "Admin Supervisor",
    "notes": "Assigned for project SpaceX",
    "status": "active"
  },
  {
    "id": "7747747b-f052-4bb1-b7f1-cf8fec1b1896",
    "equipmentCategory": "mobile",
    "equipmentId": "4727f244-4c43-4d04-9dca-adbde47d66bc",
    "equipmentTag": "MOB-SAM-S20FE-01",
    "employeeId": "a8a97341-dba7-4207-8ca8-4c8d0b89c880",
    "employeeName": "Tarun",
    "employeeEmail": "tarun@candelatech.com",
    "assignedDate": "2026-11-19T10:25:55.118855+00:00",
    "returnDate": null,
    "assignedBy": "Admin Supervisor",
    "notes": "Assigned for project Inventory",
    "status": "active"
  },
  {
    "id": "befcd3f9-b0dc-455e-8343-9520bbb6d089",
    "equipmentCategory": "mobile",
    "equipmentId": "10bf3fa0-4fc3-43cd-8cb6-6fe379371d5d",
    "equipmentTag": "MOB-VIVO-Y15-01",
    "employeeId": "87fb10cc-42cd-4e2a-aade-3ab578074cc4",
    "employeeName": "Aarif",
    "employeeEmail": "aarif@candelatech.com",
    "assignedDate": "2026-11-19T10:25:55.454456+00:00",
    "returnDate": null,
    "assignedBy": "Admin Supervisor",
    "notes": "Assigned for project SpaceX",
    "status": "active"
  },
  {
    "id": "221df970-c971-4ce8-8de9-1131fa5f4b42",
    "equipmentCategory": "mobile",
    "equipmentId": "fc775e68-a4d2-420e-be4d-461322371ba7",
    "equipmentTag": "MOB-VIVO-V11P-01",
    "employeeId": "87fb10cc-42cd-4e2a-aade-3ab578074cc4",
    "employeeName": "Aarif",
    "employeeEmail": "aarif@candelatech.com",
    "assignedDate": "2026-11-19T10:25:55.926855+00:00",
    "returnDate": null,
    "assignedBy": "Admin Supervisor",
    "notes": "Assigned for project SpaceX",
    "status": "active"
  },
  {
    "id": "857da176-b209-428d-93bd-eb8fdf8d44f1",
    "equipmentCategory": "mobile",
    "equipmentId": "c327fce8-c3ec-465b-98f6-f5aa3278ee2d",
    "equipmentTag": "MOB-IPHONE-15-EERO",
    "employeeId": "db40b5f4-cf6c-4434-9464-af5ce25fd6af",
    "employeeName": "Sirisha",
    "employeeEmail": "sirisha@candelatech.com",
    "assignedDate": "2026-11-19T10:25:56.257282+00:00",
    "returnDate": null,
    "assignedBy": "Admin Supervisor",
    "notes": "Assigned for project Netgear",
    "status": "active"
  },
  {
    "id": "26b9c710-5264-4640-8760-ed1933e956a0",
    "equipmentCategory": "mobile",
    "equipmentId": "f527d82a-6637-4bbd-b66c-3ec25c1b8028",
    "equipmentTag": "MOB-IPHONE-12-01",
    "employeeId": "87fb10cc-42cd-4e2a-aade-3ab578074cc4",
    "employeeName": "Aarif",
    "employeeEmail": "aarif@candelatech.com",
    "assignedDate": "2026-11-19T10:25:56.636652+00:00",
    "returnDate": null,
    "assignedBy": "Admin Supervisor",
    "notes": "Assigned for project SpaceX",
    "status": "active"
  },
  {
    "id": "9c5fee62-94f4-4398-877e-594cad7be8fe",
    "equipmentCategory": "mobile",
    "equipmentId": "cca71388-b2bc-4696-920a-cfffafbd28f2",
    "equipmentTag": "MOB-IPHONE-12-02",
    "employeeId": "87fb10cc-42cd-4e2a-aade-3ab578074cc4",
    "employeeName": "Aarif",
    "employeeEmail": "aarif@candelatech.com",
    "assignedDate": "2026-11-19T10:25:56.964056+00:00",
    "returnDate": null,
    "assignedBy": "Admin Supervisor",
    "notes": "Assigned for project SpaceX",
    "status": "active"
  },
  {
    "id": "fac3045b-5da1-4a92-bb90-bfd77a9a16d9",
    "equipmentCategory": "desktop",
    "equipmentId": "7679b855-5be5-44b6-83b8-409c47e748f7",
    "equipmentTag": "LAP-MAC-M3-01",
    "employeeId": "87fb10cc-42cd-4e2a-aade-3ab578074cc4",
    "employeeName": "Aarif",
    "employeeEmail": "aarif@candelatech.com",
    "assignedDate": "2026-11-19T10:25:57.596178+00:00",
    "returnDate": null,
    "assignedBy": "Admin Supervisor",
    "notes": "Assigned for project SpaceX",
    "status": "active"
  },
  {
    "id": "81419fa6-1c50-424a-a839-6381ab326dc6",
    "equipmentCategory": "desktop",
    "equipmentId": "1f6201ee-d448-4a72-acc0-5d08aee5503c",
    "equipmentTag": "LAP-LENOVO-01",
    "employeeId": "87fb10cc-42cd-4e2a-aade-3ab578074cc4",
    "employeeName": "Aarif",
    "employeeEmail": "aarif@candelatech.com",
    "assignedDate": "2026-11-19T10:25:58.056983+00:00",
    "returnDate": null,
    "assignedBy": "Admin Supervisor",
    "notes": "Assigned for project SpaceX",
    "status": "active"
  },
  {
    "id": "3f9a3421-b71b-4670-bbbb-cc040b80135f",
    "equipmentCategory": "desktop",
    "equipmentId": "5b5a9aa1-983c-459a-947e-f55c9e2def0a",
    "equipmentTag": "LAP-HP-CELONA-01",
    "employeeId": "2e2c0e82-dc2f-4034-b5d6-ae30cd96a13c",
    "employeeName": "Pranathi",
    "employeeEmail": "pranathi@candelatech.com",
    "assignedDate": "2026-11-19T10:25:58.540283+00:00",
    "returnDate": null,
    "assignedBy": "Admin Supervisor",
    "notes": "Assigned for project celona",
    "status": "active"
  },
  {
    "id": "2849f322-0e2b-4f69-96e0-6beb74a46451",
    "equipmentCategory": "desktop",
    "equipmentId": "6ef71b5c-58ce-47d7-838f-4792bf68de77",
    "equipmentTag": "DT-DELL-CELONA-01",
    "employeeId": "2e2c0e82-dc2f-4034-b5d6-ae30cd96a13c",
    "employeeName": "Pranathi",
    "employeeEmail": "pranathi@candelatech.com",
    "assignedDate": "2026-11-19T10:25:58.844206+00:00",
    "returnDate": null,
    "assignedBy": "Admin Supervisor",
    "notes": "Assigned for project celona",
    "status": "active"
  },
  {
    "id": "97c24bf2-6555-42dc-bf19-c0b9e69cc041",
    "equipmentCategory": "desktop",
    "equipmentId": "bf0f6b29-d3be-4b6c-b7c4-376e30caaed0",
    "equipmentTag": "LAP-HP-02",
    "employeeId": "c64fd0d8-408b-47d7-ad36-0c3fa322bc32",
    "employeeName": "Tejaswari",
    "employeeEmail": "tejaswari@candelatech.com",
    "assignedDate": "2026-11-19T10:25:59.169227+00:00",
    "returnDate": null,
    "assignedBy": "Admin Supervisor",
    "notes": "Assigned for project Netgear",
    "status": "active"
  },
  {
    "id": "cd21796f-84ac-4d2b-a058-8783db2bad4e",
    "equipmentCategory": "desktop",
    "equipmentId": "ec38b94d-6c10-4856-9e77-8a7f2f6ae010",
    "equipmentTag": "LAP-HP-03",
    "employeeId": "c64fd0d8-408b-47d7-ad36-0c3fa322bc32",
    "employeeName": "Tejaswari",
    "employeeEmail": "tejaswari@candelatech.com",
    "assignedDate": "2026-11-19T10:25:59.477332+00:00",
    "returnDate": null,
    "assignedBy": "Admin Supervisor",
    "notes": "Assigned for project Netgear",
    "status": "active"
  },
  {
    "id": "49552740-fccc-43b5-8e71-cfa044299e53",
    "equipmentCategory": "desktop",
    "equipmentId": "8dce39ee-2e9f-4bcc-afd1-98986db1c79d",
    "equipmentTag": "DT-DELL-02",
    "employeeId": "c64fd0d8-408b-47d7-ad36-0c3fa322bc32",
    "employeeName": "Tejaswari",
    "employeeEmail": "tejaswari@candelatech.com",
    "assignedDate": "2026-11-19T10:25:59.839198+00:00",
    "returnDate": null,
    "assignedBy": "Admin Supervisor",
    "notes": "Assigned for project Netgear",
    "status": "active"
  },
  {
    "id": "c6bf33c2-6456-415f-9495-4ff7dbb2e419",
    "equipmentCategory": "chamber",
    "equipmentId": "ccf4c28a-7f03-4252-a643-1eb247065dbe",
    "equipmentTag": "CH-VINSR-LRG-1",
    "employeeId": "46bd1939-c02b-4d3f-9a92-142e45a80b89",
    "employeeName": "Lokesh",
    "employeeEmail": "lokesh@candelatech.com",
    "assignedDate": "2026-11-19T10:26:00.153601+00:00",
    "returnDate": null,
    "assignedBy": "Admin Supervisor",
    "notes": "Assigned for project Jio",
    "status": "active"
  },
  {
    "id": "89c41337-2a71-4b28-8e44-fc04ed53260b",
    "equipmentCategory": "chamber",
    "equipmentId": "0e94d5cf-6f57-43d4-8492-8d4901faabcc",
    "equipmentTag": "CH-GVP-MED-3",
    "employeeId": "2e2c0e82-dc2f-4034-b5d6-ae30cd96a13c",
    "employeeName": "Pranathi",
    "employeeEmail": "pranathi@candelatech.com",
    "assignedDate": "2026-11-19T10:26:01.46193+00:00",
    "returnDate": null,
    "assignedBy": "Admin Supervisor",
    "notes": "Assigned for project Chamberlain",
    "status": "active"
  },
  {
    "id": "190a4900-e4d9-4961-a263-388ff9903b29",
    "equipmentCategory": "chamber",
    "equipmentId": "308d53b5-dee0-4263-9b4c-829848a676e9",
    "equipmentTag": "CH-GVP-MED-4",
    "employeeId": "2e2c0e82-dc2f-4034-b5d6-ae30cd96a13c",
    "employeeName": "Pranathi",
    "employeeEmail": "pranathi@candelatech.com",
    "assignedDate": "2026-11-19T10:26:01.778021+00:00",
    "returnDate": null,
    "assignedBy": "Admin Supervisor",
    "notes": "Assigned for project Chamberlain",
    "status": "active"
  },
  {
    "id": "910f5f9c-8fbf-42a7-bc04-5edb83b0bf27",
    "equipmentCategory": "chamber",
    "equipmentId": "6d9789be-afea-404b-9b2c-29d8703eced1",
    "equipmentTag": "CH-OPEL-HIAB-1",
    "employeeId": "db40b5f4-cf6c-4434-9464-af5ce25fd6af",
    "employeeName": "Sirisha",
    "employeeEmail": "sirisha@candelatech.com",
    "assignedDate": "2026-11-19T10:26:02.583606+00:00",
    "returnDate": null,
    "assignedBy": "Admin Supervisor",
    "notes": "Assigned for project Netgear",
    "status": "active"
  },
  {
    "id": "d93184da-a532-4165-bb35-14a61a32fb79",
    "equipmentCategory": "chamber",
    "equipmentId": "b51ead58-78bf-46f6-98a9-3e5898675675",
    "equipmentTag": "CH-GVP-HIAB-2",
    "employeeId": "87fb10cc-42cd-4e2a-aade-3ab578074cc4",
    "employeeName": "Aarif",
    "employeeEmail": "aarif@candelatech.com",
    "assignedDate": "2026-11-19T10:26:02.896891+00:00",
    "returnDate": null,
    "assignedBy": "Admin Supervisor",
    "notes": "Assigned for project SpaceX",
    "status": "active"
  }
];

export const INITIAL_LANFORGES: LANforgeItem[] = [
  {
    "id": "15d0eeb0-316d-4c20-be71-7e5d2919e703",
    "sNo": 1,
    "location": "OPEL",
    "testbedIp": "",
    "project": "Netgear",
    "pocId": "db40b5f4-cf6c-4434-9464-af5ce25fd6af",
    "lanforgeId": "LF-OPEL-523C-01",
    "lanforgeModel": "CT523c",
    "maxEthernetSpeed": "10 Gbps",
    "totalClients": 124,
    "noOf11beClients": 124,
    "noOf11axClients": 0,
    "noOf11acClients": 0,
    "noOf11nClients": 0,
    "status": "In-Use",
    "comments": "",
    "radios": [
      {
        "id": "e31995fd-42ba-4b57-a238-e4c3349e01fc",
        "lanforgeRef": "15d0eeb0-316d-4c20-be71-7e5d2919e703",
        "chipset": "Intel BE200",
        "quantity": 16
      },
      {
        "id": "e966832e-7279-44eb-9e87-2cf0bcc61933",
        "lanforgeRef": "15d0eeb0-316d-4c20-be71-7e5d2919e703",
        "chipset": "MTK7996",
        "quantity": 1
      }
    ],
    "isArchived": false,
    "createdAt": "2026-11-19T10:25:36.14814+00:00",
    "updatedAt": "2026-11-19T10:25:36.14814+00:00"
  },
  {
    "id": "1e719436-49ce-4759-8044-ea6e74db210f",
    "sNo": 2,
    "location": "OPEL",
    "testbedIp": "",
    "project": "Netgear",
    "pocId": "db40b5f4-cf6c-4434-9464-af5ce25fd6af",
    "lanforgeId": "LF-OPEL-523C-02",
    "lanforgeModel": "CT523c",
    "maxEthernetSpeed": "1 Gbps",
    "totalClients": 20,
    "noOf11beClients": 20,
    "noOf11axClients": 0,
    "noOf11acClients": 0,
    "noOf11nClients": 0,
    "status": "In-Use",
    "comments": "",
    "radios": [
      {
        "id": "edf042e3-dc96-4a4f-88f9-0f10fa690dde",
        "lanforgeRef": "1e719436-49ce-4759-8044-ea6e74db210f",
        "chipset": "Intel BE200",
        "quantity": 20
      }
    ],
    "isArchived": false,
    "createdAt": "2026-11-19T10:25:36.806793+00:00",
    "updatedAt": "2026-11-19T10:25:36.806793+00:00"
  },
  {
    "id": "6322e761-c46d-4874-b9e0-f3e40a0e0082",
    "sNo": 3,
    "location": "OPEL",
    "testbedIp": "",
    "project": "Inventory",
    "pocId": null,
    "lanforgeId": "LF-OPEL-523C-03",
    "lanforgeModel": "CT523c",
    "maxEthernetSpeed": "10 Gbps",
    "totalClients": 31,
    "noOf11beClients": 8,
    "noOf11axClients": 23,
    "noOf11acClients": 0,
    "noOf11nClients": 0,
    "status": "Available",
    "comments": "",
    "radios": [
      {
        "id": "1968f248-a225-4dc5-9445-423e74146f8e",
        "lanforgeRef": "6322e761-c46d-4874-b9e0-f3e40a0e0082",
        "chipset": "MTK7915",
        "quantity": 1
      },
      {
        "id": "4992c6e9-bf4e-430a-bf18-b38b26ed6857",
        "lanforgeRef": "6322e761-c46d-4874-b9e0-f3e40a0e0082",
        "chipset": "MTK7922",
        "quantity": 1
      },
      {
        "id": "c2256a67-074a-47a0-b082-d78bd84850e3",
        "lanforgeRef": "6322e761-c46d-4874-b9e0-f3e40a0e0082",
        "chipset": "Intel BE200",
        "quantity": 8
      }
    ],
    "isArchived": false,
    "createdAt": "2026-11-19T10:25:37.276355+00:00",
    "updatedAt": "2026-11-19T10:25:37.276355+00:00"
  },
  {
    "id": "2c1c1181-c573-4a42-891d-1c7394c69646",
    "sNo": 4,
    "location": "OPEL",
    "testbedIp": "",
    "project": "Netgear",
    "pocId": "b0c3330e-bffb-440f-a2dc-5353ea879e2b",
    "lanforgeId": "LF-OPEL-523C-04",
    "lanforgeModel": "CT523c",
    "maxEthernetSpeed": "10 Gbps",
    "totalClients": 114,
    "noOf11beClients": 0,
    "noOf11axClients": 114,
    "noOf11acClients": 0,
    "noOf11nClients": 0,
    "status": "In-Use",
    "comments": "",
    "radios": [
      {
        "id": "7b583ea3-581c-46e1-8ac9-d2b4cf4101ae",
        "lanforgeRef": "2c1c1181-c573-4a42-891d-1c7394c69646",
        "chipset": "MTK7915",
        "quantity": 6
      }
    ],
    "isArchived": false,
    "createdAt": "2026-11-19T10:25:37.938181+00:00",
    "updatedAt": "2026-11-19T10:25:37.938181+00:00"
  },
  {
    "id": "8479422f-81cf-46aa-aa2f-796e79182d08",
    "sNo": 5,
    "location": "PRIMA",
    "testbedIp": "192.168.215.184",
    "project": "PM Team",
    "pocId": "739c95a7-f922-4322-b37d-2f281a7d922c",
    "lanforgeId": "ct523-6e08",
    "lanforgeModel": "CT523c",
    "maxEthernetSpeed": "10 Gbps",
    "totalClients": 112,
    "noOf11beClients": 112,
    "noOf11axClients": 0,
    "noOf11acClients": 0,
    "noOf11nClients": 0,
    "status": "In-Use",
    "comments": "Intel BE200/2, Mtk7922/1, Mtk7915/1, Qualcomm ATH10k/1, Qualcomm ATH9k/1",
    "radios": [
      {
        "id": "ffa68992-584d-4b26-9a6d-609ad08bd938",
        "lanforgeRef": "8479422f-81cf-46aa-aa2f-796e79182d08",
        "chipset": "Intel BE200",
        "quantity": 4
      },
      {
        "id": "74696017-ffe6-4437-b8a6-e1885c08cb8a",
        "lanforgeRef": "8479422f-81cf-46aa-aa2f-796e79182d08",
        "chipset": "MTK7996",
        "quantity": 1
      }
    ],
    "isArchived": false,
    "createdAt": "2026-11-19T10:25:38.405333+00:00",
    "updatedAt": "2026-11-19T10:25:38.405333+00:00"
  },
  {
    "id": "453b821e-a93d-48c4-a2e1-0cd216e79a8f",
    "sNo": 6,
    "location": "OPEL",
    "testbedIp": "",
    "project": "Netgear",
    "pocId": "6513cf3b-1737-4ffe-aa45-047be56ee2fe",
    "lanforgeId": "LF-OPEL-523C-05",
    "lanforgeModel": "CT523c",
    "maxEthernetSpeed": "10 Gbps",
    "totalClients": 142,
    "noOf11beClients": 2,
    "noOf11axClients": 76,
    "noOf11acClients": 64,
    "noOf11nClients": 0,
    "status": "In-Use",
    "comments": "Intel ax210/2, MTK7915/5",
    "radios": [
      {
        "id": "4d75e35b-76f7-48cb-9416-5e5093f6e8eb",
        "lanforgeRef": "453b821e-a93d-48c4-a2e1-0cd216e79a8f",
        "chipset": "MTK7915",
        "quantity": 4
      },
      {
        "id": "1c60ef45-50de-46c2-8ef7-bc9278a72f3b",
        "lanforgeRef": "453b821e-a93d-48c4-a2e1-0cd216e79a8f",
        "chipset": "BE200",
        "quantity": 2
      },
      {
        "id": "bd1a3cd8-f9eb-4848-b4e5-a0ed87ad8c6d",
        "lanforgeRef": "453b821e-a93d-48c4-a2e1-0cd216e79a8f",
        "chipset": "ath10k-Wave1/1",
        "quantity": 1
      }
    ],
    "isArchived": false,
    "createdAt": "2026-11-19T10:25:39.045058+00:00",
    "updatedAt": "2026-11-19T10:25:39.045058+00:00"
  },
  {
    "id": "6bc0f7ac-2d0f-4085-b813-fd653901c2f1",
    "sNo": 7,
    "location": "OPEL",
    "testbedIp": "",
    "project": "Netgear",
    "pocId": "6513cf3b-1737-4ffe-aa45-047be56ee2fe",
    "lanforgeId": "LF-OPEL-523C-06",
    "lanforgeModel": "CT523c",
    "maxEthernetSpeed": "1 Gbps",
    "totalClients": 500,
    "noOf11beClients": 2,
    "noOf11axClients": 42,
    "noOf11acClients": 256,
    "noOf11nClients": 200,
    "status": "In-Use",
    "comments": "ath9k/1, ath10k/7, MTK7922/1",
    "radios": [
      {
        "id": "2fcdbae4-d17c-42bb-9ee9-e4741bd1c6d3",
        "lanforgeRef": "6bc0f7ac-2d0f-4085-b813-fd653901c2f1",
        "chipset": "BE200",
        "quantity": 2
      },
      {
        "id": "202c9548-2836-4555-8089-e97bc479fe78",
        "lanforgeRef": "6bc0f7ac-2d0f-4085-b813-fd653901c2f1",
        "chipset": "ath9k",
        "quantity": 1
      },
      {
        "id": "90e32848-c708-4cdf-a235-d0f7a554ee75",
        "lanforgeRef": "6bc0f7ac-2d0f-4085-b813-fd653901c2f1",
        "chipset": "AC wave-1/1",
        "quantity": 1
      },
      {
        "id": "bcb1e7ea-ae52-469d-a9b9-30557aa6de30",
        "lanforgeRef": "6bc0f7ac-2d0f-4085-b813-fd653901c2f1",
        "chipset": "AC Wave-2/3",
        "quantity": 1
      },
      {
        "id": "e67ef2de-889d-44fe-82ee-7bc5f3420b5e",
        "lanforgeRef": "6bc0f7ac-2d0f-4085-b813-fd653901c2f1",
        "chipset": "MTK7915",
        "quantity": 2
      },
      {
        "id": "cbe5b658-ca20-4005-a07c-d3b1198e3337",
        "lanforgeRef": "6bc0f7ac-2d0f-4085-b813-fd653901c2f1",
        "chipset": "MTK7922",
        "quantity": 1
      }
    ],
    "isArchived": false,
    "createdAt": "2026-11-19T10:25:39.853482+00:00",
    "updatedAt": "2026-11-19T10:25:39.853482+00:00"
  },
  {
    "id": "f8e26e8b-2941-447c-831c-2298e618517b",
    "sNo": 8,
    "location": "GVP",
    "testbedIp": "",
    "project": "Chamberlain",
    "pocId": "2e2c0e82-dc2f-4034-b5d6-ae30cd96a13c",
    "lanforgeId": "LF-GVP-523C-01",
    "lanforgeModel": "CT523c",
    "maxEthernetSpeed": "10 Gbps",
    "totalClients": 308,
    "noOf11beClients": 2,
    "noOf11axClients": 42,
    "noOf11acClients": 64,
    "noOf11nClients": 200,
    "status": "In-Use",
    "comments": "6 weeks",
    "radios": [
      {
        "id": "17f66d45-579c-4505-a44a-75ba02f8d475",
        "lanforgeRef": "f8e26e8b-2941-447c-831c-2298e618517b",
        "chipset": "mtk7922",
        "quantity": 1
      },
      {
        "id": "a607d130-e39d-40cb-b055-24fd2808d470",
        "lanforgeRef": "f8e26e8b-2941-447c-831c-2298e618517b",
        "chipset": "Intel BE200",
        "quantity": 2
      },
      {
        "id": "4edbcde9-36ea-46e7-9fcf-fd2678f68629",
        "lanforgeRef": "f8e26e8b-2941-447c-831c-2298e618517b",
        "chipset": "ath9k",
        "quantity": 1
      },
      {
        "id": "eba37233-1e18-4aa7-96c5-3925a13b41e2",
        "lanforgeRef": "f8e26e8b-2941-447c-831c-2298e618517b",
        "chipset": "mtk7915",
        "quantity": 2
      }
    ],
    "isArchived": false,
    "createdAt": "2026-11-19T10:25:41.110328+00:00",
    "updatedAt": "2026-11-19T10:25:41.110328+00:00"
  },
  {
    "id": "cb0754db-e594-4100-b008-7d15bb082521",
    "sNo": 9,
    "location": "VINSR",
    "testbedIp": "",
    "project": "Jio",
    "pocId": "46bd1939-c02b-4d3f-9a92-142e45a80b89",
    "lanforgeId": "LF-VINSR-523C-01",
    "lanforgeModel": "CT523c",
    "maxEthernetSpeed": "10 Gbps",
    "totalClients": 306,
    "noOf11beClients": 4,
    "noOf11axClients": 38,
    "noOf11acClients": 64,
    "noOf11nClients": 200,
    "status": "In-Use",
    "comments": "1 week",
    "radios": [
      {
        "id": "1022186a-4884-4508-9501-b3676ff5baa5",
        "lanforgeRef": "cb0754db-e594-4100-b008-7d15bb082521",
        "chipset": "Intel BE200",
        "quantity": 4
      },
      {
        "id": "76ca6921-4810-435c-a481-4739bc64a190",
        "lanforgeRef": "cb0754db-e594-4100-b008-7d15bb082521",
        "chipset": "ath9k",
        "quantity": 1
      },
      {
        "id": "a5517a22-281e-46f7-93e6-ba629a2f3635",
        "lanforgeRef": "cb0754db-e594-4100-b008-7d15bb082521",
        "chipset": "MTK7915",
        "quantity": 2
      },
      {
        "id": "47848c09-228d-4345-b5b4-30d52058ccea",
        "lanforgeRef": "cb0754db-e594-4100-b008-7d15bb082521",
        "chipset": "ath10k",
        "quantity": 1
      }
    ],
    "isArchived": false,
    "createdAt": "2026-11-19T10:25:42.070144+00:00",
    "updatedAt": "2026-11-19T10:25:42.070144+00:00"
  },
  {
    "id": "876269d4-d63e-4568-8036-59a36e910921",
    "sNo": 10,
    "location": "GVP",
    "testbedIp": "",
    "project": "SpaceX",
    "pocId": "87fb10cc-42cd-4e2a-aade-3ab578074cc4",
    "lanforgeId": "LF-GVP-523C-02",
    "lanforgeModel": "CT523c",
    "maxEthernetSpeed": "10 Gbps",
    "totalClients": 154,
    "noOf11beClients": 110,
    "noOf11axClients": 44,
    "noOf11acClients": 0,
    "noOf11nClients": 0,
    "status": "In-Use",
    "comments": "6 months",
    "radios": [
      {
        "id": "38a36ef5-de76-4c52-a6eb-42a72bb1f794",
        "lanforgeRef": "876269d4-d63e-4568-8036-59a36e910921",
        "chipset": "MTK7996",
        "quantity": 1
      },
      {
        "id": "d861d9b0-216d-4dd7-9f28-ca0d75195bd0",
        "lanforgeRef": "876269d4-d63e-4568-8036-59a36e910921",
        "chipset": "MTK7915",
        "quantity": 2
      },
      {
        "id": "584fe235-a3d4-4076-b133-3e7e9dec2010",
        "lanforgeRef": "876269d4-d63e-4568-8036-59a36e910921",
        "chipset": "AX210",
        "quantity": 2
      },
      {
        "id": "35ec19b2-626d-4cff-b358-82776eae0549",
        "lanforgeRef": "876269d4-d63e-4568-8036-59a36e910921",
        "chipset": "BE200",
        "quantity": 2
      },
      {
        "id": "00f01427-4fd8-4f1d-a985-7865fea8fb5b",
        "lanforgeRef": "876269d4-d63e-4568-8036-59a36e910921",
        "chipset": "MTK7922",
        "quantity": 1
      }
    ],
    "isArchived": false,
    "createdAt": "2026-11-19T10:25:43.022285+00:00",
    "updatedAt": "2026-11-19T10:25:43.022285+00:00"
  },
  {
    "id": "1d5f340d-9c9c-4bd1-858a-140026dce9ec",
    "sNo": 11,
    "location": "GVP",
    "testbedIp": "",
    "project": "SpaceX",
    "pocId": "a0122097-4c9e-4e87-a7f8-056edcd30957",
    "lanforgeId": "LF-GVP-523C-03",
    "lanforgeModel": "CT523c",
    "maxEthernetSpeed": "10 Gbps",
    "totalClients": 133,
    "noOf11beClients": 0,
    "noOf11axClients": 133,
    "noOf11acClients": 0,
    "noOf11nClients": 0,
    "status": "In-Use",
    "comments": "Intel AX210/32",
    "radios": [
      {
        "id": "6195a8e2-7b2a-449a-ab78-45ef830fd3ac",
        "lanforgeRef": "1d5f340d-9c9c-4bd1-858a-140026dce9ec",
        "chipset": "MTK7915",
        "quantity": 7
      }
    ],
    "isArchived": false,
    "createdAt": "2026-11-19T10:25:44.178484+00:00",
    "updatedAt": "2026-11-19T10:25:44.178484+00:00"
  },
  {
    "id": "df3db043-aa6b-4514-814b-3574ca6ccbe0",
    "sNo": 12,
    "location": "PRIMA",
    "testbedIp": "",
    "project": "GX",
    "pocId": "57c730b5-26a3-4657-8455-41692b75770a",
    "lanforgeId": "LF-PRIMA-523C-01",
    "lanforgeModel": "CT523c",
    "maxEthernetSpeed": "10 Gbps",
    "totalClients": 0,
    "noOf11beClients": 0,
    "noOf11axClients": 0,
    "noOf11acClients": 0,
    "noOf11nClients": 0,
    "status": "In-Use",
    "comments": "",
    "radios": [
      {
        "id": "cf358192-af7a-43cc-b588-01e34c36769c",
        "lanforgeRef": "df3db043-aa6b-4514-814b-3574ca6ccbe0",
        "chipset": "Intel BE200",
        "quantity": 2
      },
      {
        "id": "a8f7eb7c-70e3-447b-995f-24e0e3a9b6a0",
        "lanforgeRef": "df3db043-aa6b-4514-814b-3574ca6ccbe0",
        "chipset": "ath9k",
        "quantity": 1
      },
      {
        "id": "d393df3e-3ef1-44fb-bc84-9cb21f330fb3",
        "lanforgeRef": "df3db043-aa6b-4514-814b-3574ca6ccbe0",
        "chipset": "MTK7915",
        "quantity": 3
      }
    ],
    "isArchived": false,
    "createdAt": "2026-11-19T10:25:44.668523+00:00",
    "updatedAt": "2026-11-19T10:25:44.668523+00:00"
  },
  {
    "id": "58f9ead1-b699-45e7-b781-e8a381aa0a4d",
    "sNo": 13,
    "location": "OPEL",
    "testbedIp": "",
    "project": "Netgear",
    "pocId": "a65777b2-7fa8-43be-af63-2f4cd49184d9",
    "lanforgeId": "CT523c-6e06",
    "lanforgeModel": "CT523c",
    "maxEthernetSpeed": "10 Gbps",
    "totalClients": 0,
    "noOf11beClients": 0,
    "noOf11axClients": 0,
    "noOf11acClients": 0,
    "noOf11nClients": 0,
    "status": "In-Use",
    "comments": "",
    "radios": [
      {
        "id": "795619af-83a2-4e9d-881f-f7682e5a9770",
        "lanforgeRef": "58f9ead1-b699-45e7-b781-e8a381aa0a4d",
        "chipset": "Intel BE200",
        "quantity": 4
      },
      {
        "id": "847249e8-cd79-4601-94e0-e35bccea89e7",
        "lanforgeRef": "58f9ead1-b699-45e7-b781-e8a381aa0a4d",
        "chipset": "MTK7922",
        "quantity": 4
      },
      {
        "id": "d8c85b72-5ff1-4fc9-ac34-eea3de2fbc69",
        "lanforgeRef": "58f9ead1-b699-45e7-b781-e8a381aa0a4d",
        "chipset": "MTK7915",
        "quantity": 2
      }
    ],
    "isArchived": false,
    "createdAt": "2026-11-19T10:25:45.516783+00:00",
    "updatedAt": "2026-11-19T10:25:45.516783+00:00"
  },
  {
    "id": "2aaf0b6a-19db-44e5-a19d-7afdffca2c7d",
    "sNo": 14,
    "location": "OPEL",
    "testbedIp": "",
    "project": "Inventory",
    "pocId": null,
    "lanforgeId": "CT523c-2117",
    "lanforgeModel": "CT523c",
    "maxEthernetSpeed": "10 Gbps",
    "totalClients": 0,
    "noOf11beClients": 0,
    "noOf11axClients": 0,
    "noOf11acClients": 0,
    "noOf11nClients": 0,
    "status": "Available",
    "comments": "",
    "radios": [
      {
        "id": "8fce6cf9-a497-4f74-aa81-b96422b7ea90",
        "lanforgeRef": "2aaf0b6a-19db-44e5-a19d-7afdffca2c7d",
        "chipset": "Intel BE200",
        "quantity": 2
      },
      {
        "id": "c2c05f47-2664-47da-89b4-59ef6c59a9f8",
        "lanforgeRef": "2aaf0b6a-19db-44e5-a19d-7afdffca2c7d",
        "chipset": "MTK7915",
        "quantity": 2
      }
    ],
    "isArchived": false,
    "createdAt": "2026-11-19T10:25:46.31663+00:00",
    "updatedAt": "2026-11-19T10:25:46.31663+00:00"
  },
  {
    "id": "ea970c6b-1b18-4a93-96ac-8325c6f2737d",
    "sNo": 15,
    "location": "VINSR",
    "testbedIp": "",
    "project": "Netgear",
    "pocId": null,
    "lanforgeId": "LF-523B-01",
    "lanforgeModel": "CT523b",
    "maxEthernetSpeed": "1 Gbps",
    "totalClients": 166,
    "noOf11beClients": 0,
    "noOf11axClients": 38,
    "noOf11acClients": 128,
    "noOf11nClients": 0,
    "status": "Available",
    "comments": "",
    "radios": [
      {
        "id": "1ddb56fd-4560-457c-a8c8-c048243bf847",
        "lanforgeRef": "ea970c6b-1b18-4a93-96ac-8325c6f2737d",
        "chipset": "Qualcomm ATH10k",
        "quantity": 2
      },
      {
        "id": "1c4d1083-972d-44ca-a057-b030c1a05b74",
        "lanforgeRef": "ea970c6b-1b18-4a93-96ac-8325c6f2737d",
        "chipset": "MTK7915",
        "quantity": 2
      }
    ],
    "isArchived": false,
    "createdAt": "2026-11-19T10:25:46.804402+00:00",
    "updatedAt": "2026-11-19T10:25:46.804402+00:00"
  },
  {
    "id": "ec8a1c41-bd6b-4b33-b5fe-100f30a92e7f",
    "sNo": 16,
    "location": "VINSR",
    "testbedIp": "",
    "project": "Netgear",
    "pocId": "db40b5f4-cf6c-4434-9464-af5ce25fd6af",
    "lanforgeId": "LF-523B-02",
    "lanforgeModel": "CT523b",
    "maxEthernetSpeed": "1 Gbps",
    "totalClients": 66,
    "noOf11beClients": 0,
    "noOf11axClients": 2,
    "noOf11acClients": 64,
    "noOf11nClients": 0,
    "status": "In-Use",
    "comments": "",
    "radios": [
      {
        "id": "c5e5708e-6f4b-4d14-82e8-c1696974c782",
        "lanforgeRef": "ec8a1c41-bd6b-4b33-b5fe-100f30a92e7f",
        "chipset": "Qualcomm ATH10k",
        "quantity": 4
      }
    ],
    "isArchived": false,
    "createdAt": "2026-11-19T10:25:47.296213+00:00",
    "updatedAt": "2026-11-19T10:25:47.296213+00:00"
  },
  {
    "id": "044f9454-0dd4-4b45-bdbc-f0eb08883356",
    "sNo": 17,
    "location": "VINSR",
    "testbedIp": "",
    "project": "Netgear",
    "pocId": null,
    "lanforgeId": "LF-521B-01",
    "lanforgeModel": "CT521b",
    "maxEthernetSpeed": "1 Gbps",
    "totalClients": 38,
    "noOf11beClients": 0,
    "noOf11axClients": 38,
    "noOf11acClients": 0,
    "noOf11nClients": 0,
    "status": "Available",
    "comments": "",
    "radios": [
      {
        "id": "e0196188-c209-433d-88b7-81ca4580fabf",
        "lanforgeRef": "044f9454-0dd4-4b45-bdbc-f0eb08883356",
        "chipset": "MTK7915",
        "quantity": 2
      }
    ],
    "isArchived": false,
    "createdAt": "2026-11-19T10:25:47.768058+00:00",
    "updatedAt": "2026-11-19T10:25:47.768058+00:00"
  },
  {
    "id": "61ce76f4-bfe0-434d-986c-f6ec9464384b",
    "sNo": 18,
    "location": "VINSR",
    "testbedIp": "",
    "project": "Netgear",
    "pocId": "6513cf3b-1737-4ffe-aa45-047be56ee2fe",
    "lanforgeId": "LF-521C-01",
    "lanforgeModel": "CT521c",
    "maxEthernetSpeed": "1 Gbps",
    "totalClients": 38,
    "noOf11beClients": 0,
    "noOf11axClients": 38,
    "noOf11acClients": 0,
    "noOf11nClients": 0,
    "status": "In-Use",
    "comments": "",
    "radios": [
      {
        "id": "51545333-bbc3-44e4-929b-9facc604dcf7",
        "lanforgeRef": "61ce76f4-bfe0-434d-986c-f6ec9464384b",
        "chipset": "MTK7915",
        "quantity": 2
      }
    ],
    "isArchived": false,
    "createdAt": "2026-11-19T10:25:48.093043+00:00",
    "updatedAt": "2026-11-19T10:25:48.093043+00:00"
  },
  {
    "id": "53a09eed-7aca-4eec-a320-726a86f63631",
    "sNo": 19,
    "location": "VINSR",
    "testbedIp": "",
    "project": "Inventory",
    "pocId": null,
    "lanforgeId": "LF-521A-01",
    "lanforgeModel": "CT521a",
    "maxEthernetSpeed": "800 Mbps",
    "totalClients": 2,
    "noOf11beClients": 0,
    "noOf11axClients": 2,
    "noOf11acClients": 0,
    "noOf11nClients": 0,
    "status": "Available",
    "comments": "",
    "radios": [
      {
        "id": "b0eb718e-ea5a-42b8-989a-f2b3f7004848",
        "lanforgeRef": "53a09eed-7aca-4eec-a320-726a86f63631",
        "chipset": "Intel AX210",
        "quantity": 2
      }
    ],
    "isArchived": false,
    "createdAt": "2026-11-19T10:25:48.572845+00:00",
    "updatedAt": "2026-11-19T10:25:48.572845+00:00"
  },
  {
    "id": "a0f06652-f53e-4fb7-bf74-f007c2bda850",
    "sNo": 20,
    "location": "VINSR",
    "testbedIp": "",
    "project": "Hotwire",
    "pocId": "a0122097-4c9e-4e87-a7f8-056edcd30957",
    "lanforgeId": "LF-521A-02",
    "lanforgeModel": "CT521a",
    "maxEthernetSpeed": "800 Mbps",
    "totalClients": 38,
    "noOf11beClients": 0,
    "noOf11axClients": 38,
    "noOf11acClients": 0,
    "noOf11nClients": 0,
    "status": "In-Use",
    "comments": "",
    "radios": [
      {
        "id": "6231c0e6-8dea-406e-85fb-18b958864e7a",
        "lanforgeRef": "a0f06652-f53e-4fb7-bf74-f007c2bda850",
        "chipset": "MTK7915",
        "quantity": 2
      }
    ],
    "isArchived": false,
    "createdAt": "2026-11-19T10:25:48.921182+00:00",
    "updatedAt": "2026-11-19T10:25:48.921182+00:00"
  },
  {
    "id": "bea6d80d-1d1c-4fdd-a4ed-7f38f748f038",
    "sNo": 21,
    "location": "VINSR",
    "testbedIp": "",
    "project": "Inventory",
    "pocId": null,
    "lanforgeId": "LF-521A-03",
    "lanforgeModel": "CT521a",
    "maxEthernetSpeed": "800 Mbps",
    "totalClients": 4,
    "noOf11beClients": 0,
    "noOf11axClients": 0,
    "noOf11acClients": 0,
    "noOf11nClients": 0,
    "status": "Available",
    "comments": "",
    "radios": [
      {
        "id": "910f91ab-d1bb-4061-ba04-1edda4efca49",
        "lanforgeRef": "bea6d80d-1d1c-4fdd-a4ed-7f38f748f038",
        "chipset": "MTK7922",
        "quantity": 1
      }
    ],
    "isArchived": false,
    "createdAt": "2026-11-19T10:25:49.404738+00:00",
    "updatedAt": "2026-11-19T10:25:49.404738+00:00"
  },
  {
    "id": "5072b332-963f-4245-ba32-7a31808438a1",
    "sNo": 22,
    "location": "GVP",
    "testbedIp": "",
    "project": "SpaceX",
    "pocId": "87fb10cc-42cd-4e2a-aade-3ab578074cc4",
    "lanforgeId": "LF-521A-04",
    "lanforgeModel": "CT521a",
    "maxEthernetSpeed": "800 Mbps",
    "totalClients": 38,
    "noOf11beClients": 0,
    "noOf11axClients": 38,
    "noOf11acClients": 0,
    "noOf11nClients": 0,
    "status": "In-Use",
    "comments": "GVP",
    "radios": [
      {
        "id": "db2fff38-a2a7-4c70-b38f-9fc9f9524693",
        "lanforgeRef": "5072b332-963f-4245-ba32-7a31808438a1",
        "chipset": "MTK7915",
        "quantity": 2
      }
    ],
    "isArchived": false,
    "createdAt": "2026-11-19T10:25:49.960668+00:00",
    "updatedAt": "2026-11-19T10:25:49.960668+00:00"
  },
  {
    "id": "83713a2c-5f3d-4858-8014-951b88b5067a",
    "sNo": 23,
    "location": "VINSR",
    "testbedIp": "",
    "project": "Inventory",
    "pocId": null,
    "lanforgeId": "LF-521A-05",
    "lanforgeModel": "CT521a",
    "maxEthernetSpeed": "800 Mbps",
    "totalClients": 38,
    "noOf11beClients": 0,
    "noOf11axClients": 38,
    "noOf11acClients": 0,
    "noOf11nClients": 0,
    "status": "Available",
    "comments": "",
    "radios": [
      {
        "id": "c2e41aba-036d-4ae5-b688-222b01c0def0",
        "lanforgeRef": "83713a2c-5f3d-4858-8014-951b88b5067a",
        "chipset": "Qualcomm ATH10k",
        "quantity": 1
      },
      {
        "id": "e2cd2354-83b5-4d62-9e85-2ca2d477d15f",
        "lanforgeRef": "83713a2c-5f3d-4858-8014-951b88b5067a",
        "chipset": "Qualcomm ATH9k",
        "quantity": 1
      }
    ],
    "isArchived": false,
    "createdAt": "2026-11-19T10:25:50.472365+00:00",
    "updatedAt": "2026-11-19T10:25:50.472365+00:00"
  },
  {
    "id": "f9593dd8-0596-41df-99a7-063427e2f09c",
    "sNo": 24,
    "location": "VINSR",
    "testbedIp": "",
    "project": "Inventory",
    "pocId": null,
    "lanforgeId": "LF-521A-06",
    "lanforgeModel": "CT521a",
    "maxEthernetSpeed": "800 Mbps",
    "totalClients": 201,
    "noOf11beClients": 1,
    "noOf11axClients": 0,
    "noOf11acClients": 0,
    "noOf11nClients": 200,
    "status": "Available",
    "comments": "",
    "radios": [
      {
        "id": "f702c0ea-c11a-45df-b2e4-b9b45fdb793e",
        "lanforgeRef": "f9593dd8-0596-41df-99a7-063427e2f09c",
        "chipset": "Qualcomm ATH9k",
        "quantity": 1
      },
      {
        "id": "88cf2720-7d90-4fda-890a-3eeb905e0227",
        "lanforgeRef": "f9593dd8-0596-41df-99a7-063427e2f09c",
        "chipset": "BE200",
        "quantity": 1
      }
    ],
    "isArchived": false,
    "createdAt": "2026-11-19T10:25:50.95167+00:00",
    "updatedAt": "2026-11-19T10:25:50.95167+00:00"
  },
  {
    "id": "1b2baa41-c07a-4ee9-bd97-d399d366e388",
    "sNo": 25,
    "location": "VINSR",
    "testbedIp": "",
    "project": "Hotwire",
    "pocId": "a0122097-4c9e-4e87-a7f8-056edcd30957",
    "lanforgeId": "LF-521A-07",
    "lanforgeModel": "CT521a",
    "maxEthernetSpeed": "800 Mbps",
    "totalClients": 38,
    "noOf11beClients": 0,
    "noOf11axClients": 38,
    "noOf11acClients": 0,
    "noOf11nClients": 0,
    "status": "In-Use",
    "comments": "",
    "radios": [
      {
        "id": "e4935ff9-f9c6-4166-8ec4-762c84696f1c",
        "lanforgeRef": "1b2baa41-c07a-4ee9-bd97-d399d366e388",
        "chipset": "MTK7915",
        "quantity": 2
      }
    ],
    "isArchived": false,
    "createdAt": "2026-11-19T10:25:51.439365+00:00",
    "updatedAt": "2026-11-19T10:25:51.439365+00:00"
  },
  {
    "id": "f6794262-e976-4fbb-bb8c-2b3fece84793",
    "sNo": 26,
    "location": "VINSR",
    "testbedIp": "",
    "project": "Hotwire",
    "pocId": "a0122097-4c9e-4e87-a7f8-056edcd30957",
    "lanforgeId": "LF-521A-08",
    "lanforgeModel": "CT521a",
    "maxEthernetSpeed": "800 Mbps",
    "totalClients": 0,
    "noOf11beClients": 0,
    "noOf11axClients": 0,
    "noOf11acClients": 0,
    "noOf11nClients": 0,
    "status": "In-Use",
    "comments": "",
    "radios": [
      {
        "id": "a4ae0297-b598-4366-b854-78cd2be5bfa4",
        "lanforgeRef": "f6794262-e976-4fbb-bb8c-2b3fece84793",
        "chipset": "Qualcomm ATH10k",
        "quantity": 2
      }
    ],
    "isArchived": false,
    "createdAt": "2026-11-19T10:25:51.91851+00:00",
    "updatedAt": "2026-11-19T10:25:51.91851+00:00"
  },
  {
    "id": "b72655ae-50f1-4ea9-80c9-f45f417a3fbb",
    "sNo": 27,
    "location": "VINSR",
    "testbedIp": "",
    "project": "Inventory",
    "pocId": null,
    "lanforgeId": "LF-521A-09",
    "lanforgeModel": "CT521a",
    "maxEthernetSpeed": "800 Mbps",
    "totalClients": 0,
    "noOf11beClients": 0,
    "noOf11axClients": 0,
    "noOf11acClients": 0,
    "noOf11nClients": 0,
    "status": "Available",
    "comments": "",
    "radios": [
      {
        "id": "e9891108-2c35-4a8f-9000-608af9fb0fd5",
        "lanforgeRef": "b72655ae-50f1-4ea9-80c9-f45f417a3fbb",
        "chipset": "Qualcomm ATH10k",
        "quantity": 2
      }
    ],
    "isArchived": false,
    "createdAt": "2026-11-19T10:25:52.394891+00:00",
    "updatedAt": "2026-11-19T10:25:52.394891+00:00"
  }
];

export const INITIAL_DESKTOPS: DesktopItem[] = [
  {
    "id": "7679b855-5be5-44b6-83b8-409c47e748f7",
    "sNo": 1,
    "deviceId": "LAP-MAC-M3-01",
    "deviceBrand": "MacBook",
    "model": "Air M3",
    "project": "SpaceX",
    "pocId": "87fb10cc-42cd-4e2a-aade-3ab578074cc4",
    "status": "In-Use",
    "isArchived": false,
    "createdAt": "2026-11-19T10:25:57.430318+00:00",
    "updatedAt": "2026-11-19T10:25:57.430318+00:00"
  },
  {
    "id": "e2133fc5-cb9c-466f-a05c-d6f9e6029cfd",
    "sNo": 2,
    "deviceId": "TAB-IPAD-01",
    "deviceBrand": "IPad",
    "model": "iPad",
    "project": "Inventory",
    "pocId": null,
    "status": "Available",
    "isArchived": false,
    "createdAt": "2026-11-19T10:25:57.752613+00:00",
    "updatedAt": "2026-11-19T10:25:57.752613+00:00"
  },
  {
    "id": "1f6201ee-d448-4a72-acc0-5d08aee5503c",
    "sNo": 3,
    "deviceId": "LAP-LENOVO-01",
    "deviceBrand": "Lenovo",
    "model": "ThinkPad Laptop",
    "project": "SpaceX",
    "pocId": "87fb10cc-42cd-4e2a-aade-3ab578074cc4",
    "status": "In-Use",
    "isArchived": false,
    "createdAt": "2026-11-19T10:25:57.905023+00:00",
    "updatedAt": "2026-11-19T10:25:57.905023+00:00"
  },
  {
    "id": "08bce353-42d4-4cfa-aa86-9bc949858869",
    "sNo": 4,
    "deviceId": "LAP-QC-EERO-01",
    "deviceBrand": "Qualcomm",
    "model": "Qualcomm laptop eero",
    "project": "Inventory",
    "pocId": null,
    "status": "Available",
    "isArchived": false,
    "createdAt": "2026-11-19T10:25:58.218916+00:00",
    "updatedAt": "2026-11-19T10:25:58.218916+00:00"
  },
  {
    "id": "5b5a9aa1-983c-459a-947e-f55c9e2def0a",
    "sNo": 5,
    "deviceId": "LAP-HP-CELONA-01",
    "deviceBrand": "HP",
    "model": "Windows Workstation",
    "project": "celona",
    "pocId": "2e2c0e82-dc2f-4034-b5d6-ae30cd96a13c",
    "status": "In-Use",
    "isArchived": false,
    "createdAt": "2026-11-19T10:25:58.380387+00:00",
    "updatedAt": "2026-11-19T10:25:58.380387+00:00"
  },
  {
    "id": "6ef71b5c-58ce-47d7-838f-4792bf68de77",
    "sNo": 6,
    "deviceId": "DT-DELL-CELONA-01",
    "deviceBrand": "Dell",
    "model": "Linux Controller",
    "project": "celona",
    "pocId": "2e2c0e82-dc2f-4034-b5d6-ae30cd96a13c",
    "status": "In-Use",
    "isArchived": false,
    "createdAt": "2026-11-19T10:25:58.690618+00:00",
    "updatedAt": "2026-11-19T10:25:58.690618+00:00"
  },
  {
    "id": "bf0f6b29-d3be-4b6c-b7c4-376e30caaed0",
    "sNo": 7,
    "deviceId": "LAP-HP-02",
    "deviceBrand": "HP",
    "model": "Laptop",
    "project": "Netgear",
    "pocId": "c64fd0d8-408b-47d7-ad36-0c3fa322bc32",
    "status": "In-Use",
    "isArchived": false,
    "createdAt": "2026-11-19T10:25:59.00361+00:00",
    "updatedAt": "2026-11-19T10:25:59.00361+00:00"
  },
  {
    "id": "ec38b94d-6c10-4856-9e77-8a7f2f6ae010",
    "sNo": 8,
    "deviceId": "LAP-HP-03",
    "deviceBrand": "HP",
    "model": "Laptop",
    "project": "Netgear",
    "pocId": "c64fd0d8-408b-47d7-ad36-0c3fa322bc32",
    "status": "In-Use",
    "isArchived": false,
    "createdAt": "2026-11-19T10:25:59.325064+00:00",
    "updatedAt": "2026-11-19T10:25:59.325064+00:00"
  },
  {
    "id": "8dce39ee-2e9f-4bcc-afd1-98986db1c79d",
    "sNo": 9,
    "deviceId": "DT-DELL-02",
    "deviceBrand": "Dell",
    "model": "Workstation",
    "project": "Netgear",
    "pocId": "c64fd0d8-408b-47d7-ad36-0c3fa322bc32",
    "status": "In-Use",
    "isArchived": false,
    "createdAt": "2026-11-19T10:25:59.634582+00:00",
    "updatedAt": "2026-11-19T10:25:59.634582+00:00"
  }
];

export const INITIAL_MOBILES: MobileItem[] = [
  {
    "id": "ffb70aa1-f3c9-4646-b66b-ac90c3c42dde",
    "sNo": 1,
    "deviceId": "MOB-SAM-S25-EERO",
    "deviceBrand": "Samsung",
    "model": "S25",
    "project": "Netgear",
    "pocId": "db40b5f4-cf6c-4434-9464-af5ce25fd6af",
    "status": "In-Use",
    "isArchived": false,
    "createdAt": "2026-11-19T10:25:52.710683+00:00",
    "updatedAt": "2026-11-19T10:25:52.710683+00:00"
  },
  {
    "id": "1db16245-4b89-4578-b0ea-1a281c8b9a65",
    "sNo": 2,
    "deviceId": "MOB-SAM-S23-01",
    "deviceBrand": "Samsung",
    "model": "S23",
    "project": "Inventory",
    "pocId": null,
    "status": "Available",
    "isArchived": false,
    "createdAt": "2026-11-19T10:25:53.033341+00:00",
    "updatedAt": "2026-11-19T10:25:53.033341+00:00"
  },
  {
    "id": "8c71f0b9-f488-4480-8eef-9f1cc7d6885f",
    "sNo": 3,
    "deviceId": "MOB-SAM-S21U-EERO",
    "deviceBrand": "Samsung",
    "model": "S21 ultra 5G",
    "project": "Inventory",
    "pocId": null,
    "status": "Available",
    "isArchived": false,
    "createdAt": "2026-11-19T10:25:53.197961+00:00",
    "updatedAt": "2026-11-19T10:25:53.197961+00:00"
  },
  {
    "id": "75367a4a-2bb0-4129-aef0-b2734e120897",
    "sNo": 4,
    "deviceId": "MOB-OP-11-EERO",
    "deviceBrand": "Oneplus",
    "model": "11 5G",
    "project": "Netgear",
    "pocId": "db40b5f4-cf6c-4434-9464-af5ce25fd6af",
    "status": "In-Use",
    "isArchived": false,
    "createdAt": "2026-11-19T10:25:53.368313+00:00",
    "updatedAt": "2026-11-19T10:25:53.368313+00:00"
  },
  {
    "id": "771e5de4-cb7a-476f-98b6-d3023756365d",
    "sNo": 5,
    "deviceId": "MOB-PIXEL-8-EERO",
    "deviceBrand": "Google Pixel",
    "model": "8",
    "project": "Netgear",
    "pocId": "db40b5f4-cf6c-4434-9464-af5ce25fd6af",
    "status": "In-Use",
    "isArchived": false,
    "createdAt": "2026-11-19T10:25:54.099651+00:00",
    "updatedAt": "2026-11-19T10:25:54.099651+00:00"
  },
  {
    "id": "95e107fe-4459-41b6-bcfc-2af2af9778eb",
    "sNo": 6,
    "deviceId": "MOB-PIXEL-8-MNT",
    "deviceBrand": "Google Pixel",
    "model": "8",
    "project": "Maintenance",
    "pocId": null,
    "status": "Under Maintenance",
    "isArchived": false,
    "createdAt": "2026-11-19T10:25:54.427373+00:00",
    "updatedAt": "2026-11-19T10:25:54.427373+00:00"
  },
  {
    "id": "000763d2-1d46-4ec4-8c04-10f939b99981",
    "sNo": 7,
    "deviceId": "MOB-HONOR-9X-01",
    "deviceBrand": "Honor",
    "model": "9X",
    "project": "SpaceX",
    "pocId": "87fb10cc-42cd-4e2a-aade-3ab578074cc4",
    "status": "In-Use",
    "isArchived": false,
    "createdAt": "2026-11-19T10:25:54.600321+00:00",
    "updatedAt": "2026-11-19T10:25:54.600321+00:00"
  },
  {
    "id": "4727f244-4c43-4d04-9dca-adbde47d66bc",
    "sNo": 8,
    "deviceId": "MOB-SAM-S20FE-01",
    "deviceBrand": "Samsung",
    "model": "S20 FE",
    "project": "Inventory",
    "pocId": "a8a97341-dba7-4207-8ca8-4c8d0b89c880",
    "status": "In-Use",
    "isArchived": false,
    "createdAt": "2026-11-19T10:25:54.945466+00:00",
    "updatedAt": "2026-11-19T10:25:54.945466+00:00"
  },
  {
    "id": "10bf3fa0-4fc3-43cd-8cb6-6fe379371d5d",
    "sNo": 9,
    "deviceId": "MOB-VIVO-Y15-01",
    "deviceBrand": "Vivo",
    "model": "Y15",
    "project": "SpaceX",
    "pocId": "87fb10cc-42cd-4e2a-aade-3ab578074cc4",
    "status": "In-Use",
    "isArchived": false,
    "createdAt": "2026-11-19T10:25:55.297133+00:00",
    "updatedAt": "2026-11-19T10:25:55.297133+00:00"
  },
  {
    "id": "e9d58e58-8c5d-4d9d-b742-7aaf1c54bdea",
    "sNo": 10,
    "deviceId": "MOB-OPPO-A55-01",
    "deviceBrand": "oppo",
    "model": "A55",
    "project": "Inventory",
    "pocId": null,
    "status": "Available",
    "isArchived": false,
    "createdAt": "2026-11-19T10:25:55.607209+00:00",
    "updatedAt": "2026-11-19T10:25:55.607209+00:00"
  },
  {
    "id": "fc775e68-a4d2-420e-be4d-461322371ba7",
    "sNo": 11,
    "deviceId": "MOB-VIVO-V11P-01",
    "deviceBrand": "Vivo",
    "model": "V11 pro",
    "project": "SpaceX",
    "pocId": "87fb10cc-42cd-4e2a-aade-3ab578074cc4",
    "status": "In-Use",
    "isArchived": false,
    "createdAt": "2026-11-19T10:25:55.7694+00:00",
    "updatedAt": "2026-11-19T10:25:55.7694+00:00"
  },
  {
    "id": "c327fce8-c3ec-465b-98f6-f5aa3278ee2d",
    "sNo": 12,
    "deviceId": "MOB-IPHONE-15-EERO",
    "deviceBrand": "Apple",
    "model": "iPhone 15",
    "project": "Netgear",
    "pocId": "db40b5f4-cf6c-4434-9464-af5ce25fd6af",
    "status": "In-Use",
    "isArchived": false,
    "createdAt": "2026-11-19T10:25:56.082043+00:00",
    "updatedAt": "2026-11-19T10:25:56.082043+00:00"
  },
  {
    "id": "f527d82a-6637-4bbd-b66c-3ec25c1b8028",
    "sNo": 13,
    "deviceId": "MOB-IPHONE-12-01",
    "deviceBrand": "Apple",
    "model": "iPhone 12",
    "project": "SpaceX",
    "pocId": "87fb10cc-42cd-4e2a-aade-3ab578074cc4",
    "status": "In-Use",
    "isArchived": false,
    "createdAt": "2026-11-19T10:25:56.423636+00:00",
    "updatedAt": "2026-11-19T10:25:56.423636+00:00"
  },
  {
    "id": "cca71388-b2bc-4696-920a-cfffafbd28f2",
    "sNo": 14,
    "deviceId": "MOB-IPHONE-12-02",
    "deviceBrand": "Apple",
    "model": "iPhone 12",
    "project": "SpaceX",
    "pocId": "87fb10cc-42cd-4e2a-aade-3ab578074cc4",
    "status": "In-Use",
    "isArchived": false,
    "createdAt": "2026-11-19T10:25:56.791571+00:00",
    "updatedAt": "2026-11-19T10:25:56.791571+00:00"
  },
  {
    "id": "50213e82-efc7-4b61-b7b8-577ce5ba9949",
    "sNo": 15,
    "deviceId": "MOB-OP-12-EERO",
    "deviceBrand": "Oneplus",
    "model": "12",
    "project": "Inventory",
    "pocId": null,
    "status": "Available",
    "isArchived": false,
    "createdAt": "2026-11-19T10:25:57.112967+00:00",
    "updatedAt": "2026-11-19T10:25:57.112967+00:00"
  },
  {
    "id": "1e169117-aa6a-4a7f-9e2a-7c05a7ae17ed",
    "sNo": 16,
    "deviceId": "MOB-SAM-BULGE-MNT",
    "deviceBrand": "Samsung",
    "model": "Battery bulge",
    "project": "Maintenance",
    "pocId": null,
    "status": "Under Maintenance",
    "isArchived": false,
    "createdAt": "2026-11-19T10:25:57.270643+00:00",
    "updatedAt": "2026-11-19T10:25:57.270643+00:00"
  }
];

export const INITIAL_CHAMBERS: ChamberItem[] = [
  {
    "id": "ccf4c28a-7f03-4252-a643-1eb247065dbe",
    "sNo": 1,
    "chamberType": "Large (VINSR)",
    "chamberId": "CH-VINSR-LRG-1",
    "usedById": "46bd1939-c02b-4d3f-9a92-142e45a80b89",
    "project": "Jio",
    "status": "In-Use",
    "isArchived": false,
    "createdAt": "2026-11-19T10:25:59.995207+00:00",
    "updatedAt": "2026-11-19T10:25:59.995207+00:00"
  },
  {
    "id": "c3bcbd1e-3c18-48bb-bbe4-1f7aaf23d22a",
    "sNo": 2,
    "chamberType": "Large (VINSR)",
    "chamberId": "CH-VINSR-LRG-2",
    "usedById": null,
    "project": "Inventory",
    "status": "Available",
    "isArchived": false,
    "createdAt": "2026-11-19T10:26:00.302952+00:00",
    "updatedAt": "2026-11-19T10:26:00.302952+00:00"
  },
  {
    "id": "9865636d-6e38-4ce8-a0e0-516371adb5fc",
    "sNo": 3,
    "chamberType": "Large (VINSR)",
    "chamberId": "CH-VINSR-LRG-3",
    "usedById": null,
    "project": "Inventory",
    "status": "Available",
    "isArchived": false,
    "createdAt": "2026-11-19T10:26:00.472537+00:00",
    "updatedAt": "2026-11-19T10:26:00.472537+00:00"
  },
  {
    "id": "ff93c763-4c47-408f-a0c3-616efaea7808",
    "sNo": 4,
    "chamberType": "Large (VINSR)",
    "chamberId": "CH-VINSR-LRG-4",
    "usedById": null,
    "project": "Inventory",
    "status": "Available",
    "isArchived": false,
    "createdAt": "2026-11-19T10:26:00.63206+00:00",
    "updatedAt": "2026-11-19T10:26:00.63206+00:00"
  },
  {
    "id": "583fefc7-8f86-478e-adb7-912a2d63d342",
    "sNo": 5,
    "chamberType": "Large (VINSR)",
    "chamberId": "CH-VINSR-LRG-5",
    "usedById": null,
    "project": "Inventory",
    "status": "Available",
    "isArchived": false,
    "createdAt": "2026-11-19T10:26:00.787174+00:00",
    "updatedAt": "2026-11-19T10:26:00.787174+00:00"
  },
  {
    "id": "c80cd6a9-1f8c-46c2-9fed-9127b809848b",
    "sNo": 6,
    "chamberType": "Medium (VINSR)",
    "chamberId": "CH-VINSR-MED-1",
    "usedById": null,
    "project": "Inventory",
    "status": "Available",
    "isArchived": false,
    "createdAt": "2026-11-19T10:26:00.96853+00:00",
    "updatedAt": "2026-11-19T10:26:00.96853+00:00"
  },
  {
    "id": "8720821f-b1f2-4877-a5bd-0f55bdd7184c",
    "sNo": 7,
    "chamberType": "Medium (VINSR)",
    "chamberId": "CH-VINSR-MED-2",
    "usedById": null,
    "project": "Inventory",
    "status": "Available",
    "isArchived": false,
    "createdAt": "2026-11-19T10:26:01.133518+00:00",
    "updatedAt": "2026-11-19T10:26:01.133518+00:00"
  },
  {
    "id": "0e94d5cf-6f57-43d4-8492-8d4901faabcc",
    "sNo": 8,
    "chamberType": "Medium (GVP)",
    "chamberId": "CH-GVP-MED-3",
    "usedById": "2e2c0e82-dc2f-4034-b5d6-ae30cd96a13c",
    "project": "Chamberlain",
    "status": "In-Use",
    "isArchived": false,
    "createdAt": "2026-11-19T10:26:01.297955+00:00",
    "updatedAt": "2026-11-19T10:26:01.297955+00:00"
  },
  {
    "id": "308d53b5-dee0-4263-9b4c-829848a676e9",
    "sNo": 9,
    "chamberType": "Medium (GVP)",
    "chamberId": "CH-GVP-MED-4",
    "usedById": "2e2c0e82-dc2f-4034-b5d6-ae30cd96a13c",
    "project": "Chamberlain",
    "status": "In-Use",
    "isArchived": false,
    "createdAt": "2026-11-19T10:26:01.618525+00:00",
    "updatedAt": "2026-11-19T10:26:01.618525+00:00"
  },
  {
    "id": "aeb21f17-ad30-4b60-b30a-330d2fea3c71",
    "sNo": 10,
    "chamberType": "Medium (GVP)",
    "chamberId": "CH-GVP-MED-5",
    "usedById": null,
    "project": "Inventory",
    "status": "Available",
    "isArchived": false,
    "createdAt": "2026-11-19T10:26:01.937831+00:00",
    "updatedAt": "2026-11-19T10:26:01.937831+00:00"
  },
  {
    "id": "5f9492be-d33b-4e85-a419-0c52e2612d09",
    "sNo": 11,
    "chamberType": "Medium (GVP)",
    "chamberId": "CH-GVP-MED-6",
    "usedById": null,
    "project": "Inventory",
    "status": "Available",
    "isArchived": false,
    "createdAt": "2026-11-19T10:26:02.091081+00:00",
    "updatedAt": "2026-11-19T10:26:02.091081+00:00"
  },
  {
    "id": "cc60b885-7f9d-41c4-b204-356ebf0a32b0",
    "sNo": 12,
    "chamberType": "Medium (GVP)",
    "chamberId": "CH-GVP-MED-7",
    "usedById": null,
    "project": "Inventory",
    "status": "Available",
    "isArchived": false,
    "createdAt": "2026-11-19T10:26:02.245604+00:00",
    "updatedAt": "2026-11-19T10:26:02.245604+00:00"
  },
  {
    "id": "6d9789be-afea-404b-9b2c-29d8703eced1",
    "sNo": 13,
    "chamberType": "HiaB (OPEL)",
    "chamberId": "CH-OPEL-HIAB-1",
    "usedById": "db40b5f4-cf6c-4434-9464-af5ce25fd6af",
    "project": "Netgear",
    "status": "In-Use",
    "isArchived": false,
    "createdAt": "2026-11-19T10:26:02.405131+00:00",
    "updatedAt": "2026-11-19T10:26:02.405131+00:00"
  },
  {
    "id": "b51ead58-78bf-46f6-98a9-3e5898675675",
    "sNo": 14,
    "chamberType": "HiaB (GVP)",
    "chamberId": "CH-GVP-HIAB-2",
    "usedById": "87fb10cc-42cd-4e2a-aade-3ab578074cc4",
    "project": "SpaceX",
    "status": "In-Use",
    "isArchived": false,
    "createdAt": "2026-11-19T10:26:02.734237+00:00",
    "updatedAt": "2026-11-19T10:26:02.734237+00:00"
  },
  {
    "id": "57435b39-b5ab-4b5a-9db5-495e7d3464e9",
    "sNo": 15,
    "chamberType": "Thermal chamber (OPEL)",
    "chamberId": "CH-OPEL-THRM-1",
    "usedById": null,
    "project": "Inventory",
    "status": "Available",
    "isArchived": false,
    "createdAt": "2026-11-19T10:26:03.054161+00:00",
    "updatedAt": "2026-11-19T10:26:03.054161+00:00"
  }
];

export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  {
    "id": "2a9b9cee-abdb-4f52-86bb-212760f6c55d",
    "timestamp": "2026-11-19T10:26:03.217679+00:00",
    "unitAssetTag": "DATABASE",
    "unitModel": "Production Inventory Database",
    "inventoryCategory": "lanforge",
    "inventoryId": null,
    "action": "created",
    "title": "Inventory Synchronized: created",
    "description": "Imported complete hardware inventory from production Excel database (Nov 2026).",
    "performedBy": "Admin Supervisor",
    "user": {
      "name": "Admin Supervisor",
      "role": "Operations Lead"
    }
  },
  {
    "id": "e06c8f70-14fc-4f13-ab56-c04c3e498deb",
    "timestamp": "2026-11-19T10:26:03.217679+00:00",
    "unitAssetTag": "DATABASE",
    "unitModel": "Production Inventory Database",
    "inventoryCategory": "lanforge",
    "inventoryId": null,
    "action": "status_change",
    "title": "Inventory Synchronized: status_change",
    "description": "Synchronized live custody assignments for Netgear, SpaceX, Jio, and Chamberlain testbeds.",
    "performedBy": "Admin Supervisor",
    "user": {
      "name": "Admin Supervisor",
      "role": "Operations Lead"
    }
  }
];
