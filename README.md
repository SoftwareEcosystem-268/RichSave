# RichSave

## ภาพรวมโปรเจกต์

โปรเจกต์นี้ใช้สำหรับเรียนวิชา Software Ecosystem

## การใช้ Branch

- main: ใช้สำหรับ production / ส่งงาน (ห้ามเขียนโดยตรง)
- dev: ใช้รวมงานก่อนขึ้น main
- feature branch: แต่ละคนแตก branch ของตัวเองมาทำงาน

## ขั้นตอนการทำงาน (Workflow)

1. แตก branch จาก dev
2. เขียนโค้ดใน branch ตัวเอง
3. Push ขึ้น GitHub
4. เปิด Pull Request เข้า dev
5. ให้เพื่อน review อย่างน้อย 1 คน
6. Merge เข้า dev
7. dev จะไป main เมื่อโปรเจกต์พร้อมทุก Feature

## รูปแบบการตั้งชื่อ Branch

RICH-<ตำแหน่งงาน>-<หมายเลขงาน>-<คำอธิบายสิ่งที่ทำสั้นๆ>

ตัวอย่าง:

- RICH-DEVOPS-01-repo-structure
- RICH-FE-02-login-ui
- RICH-BE-03-auth-api
- RICH-QA-04-regression-test
