# Access Control List for BlueSeaOS

This file defines a role named `blueseaos-readonly`.

Its intended permissions are:

|API Object|Permitted Operations|Purpose|
|--|--|--|
|`system`|`board`, `info`|Read hardware, firmware, uptime, and system statistics exposed by these methods.|
|`network.interface`|`dump`, `status`|Read interface configuration and satus information exposed by these methods.|
|`network.device`|`statu`|Read network device status.|

This role has no write permissions. It does not grant access to arbitrary files, shell execution, firewall changes, or service control.