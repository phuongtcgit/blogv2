---
title: Reset admin password Nginx Proxy Manager
description: Reset pass của Nginx có WebUI
image: ''
pubDate: 2026-10-08
tags:
  - server
draft: false
---

Lên danh sách docker, lấy ID của docker nginx proxy manager để điền vào chỗ **id_docker** lệnh dưới

```plain
docker ps
```

Vào sâu trong docker này

```plain
docker exec -it id_docker sh
```

Cài sqlite3 vì các version sau này nó dùng Sqlite rồi

```plain
apt update && apt install sqlite3 -y 
```

Vào database, xoá user

```plain
sqlite3 /data/database.sqlite
UPDATE user SET is_deleted=1;
```

Thoát sqlite. Lệnh bao gồm dấu . đầu tiên

```plain
.exit 
```

Thoát docker sh

```plain
exit 
```

Tắt và khởi động lại docker nginx

```plain
docker stop id_docker 
docker start id_docker
```

Vào lại trình duyệt và tạo lại thông tin truy cập **admin mới.**

Lúc này bạn đã truy cập vào hệ thống bằng account mới được rồi. Tuy nhiên chỉ có 1 user mới tạo. Nếu muốn sử dụng lại các user cũ thì làm như sau đây. Rồi dùng account mới tạo reset pass cho các account cũ (nếu muốn)

```plain
docker exec -it id_docker sh
  sqlite3 /data/database.sqlite
	UPDATE user SET is_deleted=0;
	.exit 
  exit
```
