#Tram RSU
ติดตามรถรางในมหาลัย

## Feature
* **ติดตามรถราง **
* **คำนวณเวลากับระยะทางที่จะมาถึง **
* **มีระบบแจ้งเตือนเมื่อต้องการติดตาม **
* **แจ้งเตือนก่อนถึง 1 สถานี **
* **บอกรายละเอียดรถ **
* **login with facebook เพื่อปลดล็อกบาง Feature **
* **Filter สถานะรถ **
* **บอกสถานะ **
* **ติดตามรถบนแผนที่ **

## Folder Structure

```
├── app/
│       app.component.ts
│       app.html
│       app.module.ts
│       app.scss
│       main.ts
├── assets/
│       icon/
│       imgs/
├── pages/
│       tram/
│           tram.html
│           tram.scss
│           tram.module.ts
│           tram.ts
│       auth/
│           login/
│               login.ts
│               login.module.ts
│               login.scss
├── provider/
│       core/
│           auth.guard.ts
│           auth.service.ts
│       tram/
│           tram.service.ts
├── models/
│       tram.interface.ts
│       user.interface.ts
├── configs/
│       environment.ts

```

## Firestore Structure

```
├── trams -c
        tramInfo -d
            tram -c
                tramId -d
                    name
                    photo
                    geolocation
                    speed
                    onDuty
        tramStopInfo -d
            tramStop -c
                tramStop -d
                    name
                    geolocation
├── users -c
        userInfo -d
            users -c
                userId -d
                    name
                    photo
                    geolocation *


```

## Stuff I wanna include

* Firebase
* Mapbox
* Ionic (angular)
* Push notification


## work
ทำให้ popup แบบขึ้นเป็น card แล้วดึงข้อมูลมาแสดง ชื่อป้าย บรรยาย รูป tramที่duty(เวลาจะถึงป้าย, ระยะทาง) ปุ่มแจ้งเตือนไว้เฉยๆ เมื่อกดปิดให้ unsubcribe

เคลียร์code ที่จำเป็น  

ทำ backend เอาโค้ดที่จำเป็นตามที่วางไว้

เมื่อใช้ได้แล้ว ทำหน้า ui ให้หมด ทั้ง auth 

เริ่มเขียนส่วนที่เหลือ

-- กด tramStop แล้ว ขึ้นการ์ดเล็กๆ บอกทุกอย่าง พร้อมปุ่มปิด ---ตรงนี้
-- tramStop Tram คำนวณแล้วไม่เรียง  0 1 2 3 ให้ใช้ async ทำให้เสร็จแล้ว ค่อยทำ

--ทำ demo รถราง --d
--ทำแจ้งเตือน --p  (--fix cal dis dur --later)
--ทำfilter 
--ทำให้ div map เลื่อนไม่ได้
--ทำให้ tram stop icon ใหม่
--ทำให้ login with facebook ได้ --d เพื่อให้กด tramstop ได้ --d
--ทำจุด marker location ตัวเอง
--เอารูปมาใส่
--ปรับ sidemenu ไม่ให้มี grid และดึงรูปมาทำ คล้าย ofo


fcm
กดแจ้งเตือนรถ เมื่อ next เป็นสถานีที่เราติดตาม จากนั้น ให้อัพเดท เป็น false 
รถจะทุกครั้ง เมื่อเปลี่ยน เพื่อหาว่าใครแจ้งเตือนไว้บ้าง .onUpdate()
