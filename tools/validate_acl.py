import json
from pathlib import Path

path = Path("files/usr/share/rpcd/acl.d/blueseaos.json")
data = json.loads(path.read_text())

role = data["blueseaos-readonly"]
methods = role["read"]["ubus"]

for object_name, method_names in methods.items():
    assert isinstance(
        method_names, list
    ), f"{object_name} must contain a list of methods"
    assert all(
        isinstance(name, str) for name in method_names
    ), f"{object_name} contains an invalid method entry"

assert "write" not in role, "This role must not grant write permissions"

print("ACL structure: valid")
print("Write permissions: none")
print("Permitted read operations:")

for object_name, method_names in methods.items():
    print(f"  {object_name}: {', '.join(method_names)}")
