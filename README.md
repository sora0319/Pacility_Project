# Pacility_Project
Show Pohang sport facility to database

## 🚩 프로젝트 개요

### 📌 1. 프로젝트 간략 소개

- **문제정의**:  
  포항시의 스포츠 시설에 대한 정보를 제공할 필요성이 있습니다. 현재 외부 스포츠 시설에 대한 정보를 얻는 것이 쉽지 않습니다. 예를 들어, 비 오는 날 농구를 하고 싶어도 실내 농구장이 어디에 있는지 알기 어렵습니다. 인터넷 검색을 해도 블로그를 통해 겨우 한두 개의 실내 농구장 정보를 찾을 수 있을 뿐이며, 대부분 유료로 이용해야 합니다. 이런 불편함을 해결하기 위해, 특정 스포츠를 즐기고 싶지만 어디에서 운동해야 할지 모르는 사용자들을 대상으로 포항의 스포츠 시설에 대한 정확한 정보를 제공하는 웹 서비스를 기획하게 되었습니다.
  
- **데이터베이스 및 애플리케이션 소개**:  
  - **데이터베이스**  
    **스포츠 시설 정보**: 시설 이름, 스포츠 유형, 예약 가능 여부  
    **세부 정보**: 주소, 연락처, 교통 정보(버스 정류장 포함), 시설 특이사항 (예: 친구와 함께 방문 시 10% 할인)  
    **운영 정보**: 평일/주말 운영 시간 및 요금

  - **애플리케이션**  
    사용자가 지역별 또는 스포츠 유형별로 시설을 검색하고 다양한 세부 정보를 확인할 수 있도록 설계되었습니다.
    또한, 새로운 시설 정보는 관리자의 승인을 거쳐 추가될 수 있습니다 

<br />

### 📌 2. 애플리케이션 제안

#### 주요 목표

포항의 스포츠 시설에 대한 상세 정보를 제공하는 웹 서비스 제공

#### 주요 기능

- 스포츠 시설 목록 보기: 포항 스포츠 시설 목록을 세부 정보와 함께 확인하고, 알파벳 또는 숫자 순서로 정렬하거나, 특정 카테고리(예: 금요일에 열려 있는 시설)별로 필터링 가능

- 특정 키워드 검색: 특정 시설, 스포츠 유형 등 검색 가능

- 새로운 스포츠 시설 업로드 요청: 새로운 스포츠 시설 추가 요청 가능하며, 관리자가 유효성을 확인 후 추가 여부 결정

- 관리자 관리: ID와 비밀번호를 통해 관리자 목록 관리

<br />

### 📌 3 스키마 다이어그램 제시 및 설명

#### 스키마 다이어그램

(스키마 다이어그램 이미지)

#### 테이블 및 속성 설명

- **Facility** (ID, image, name, type, reservation): 각 시설의 정보를 저장하고 구분하기 위한 테이블. Addr, Contact, Traffic 테이블과의 관계 형성을 위해 ID 사용
  - ID : 각 시설의 고유 식별자
  - image: 스포츠 시설 이미지(로고)
  - name : 스포츠 시설 이름
  - type : 스포츠 시설에서 가능한 운동 종류
  - reservation: 예약 가능 여부 (CAN 또는 NOT)

- **Addr** (ID, address, zip) : 시설 주소를 저장하는 테이블
  - ID : 각 시설의 고유 식별자 (Facility 참조)
  - address : 스포츠 시설 주소
  - zip : 우편번호

- **Contact** (ID, number, email) : 각 시설의 연락처 정보를 저장하는 테이블
  - ID : 각 시설의 고유 식별자 (Facility 참조)
  - number : 스포츠 시설 전화번호
  - email : 스포츠 시설 이메일 주소

- **Traffic** (trafficID, ID, busStopID) : 시설 주변 버스 정류장 정보를 저장하는 테이블. BusStop 테이블과 관계를 가짐
  - trafficID : 교통 정보 리스트 관리용 ID
  - ID : 각 시설의 고유 식별자 (Facility 참조)
  - busStopID : 고정된 버스 정류장 ID

- **BusStop** (busStopID, busStopName, busNumber) : 버스 정류장 이름과 도착 버스 정보를 저장하는 테이블
  - busStopID : 고정된 버스 정류장 ID
  - busStopName : 버스 정류장 이름
  - busNumber : 버스 정류장에 도착하는 버스 번호

- **NewFac** (Unreg_ID, ID) : 새로운 스포츠 시설에 대한 관리자 권한을 얻기 위해 생성된 테이블
  - Unreg_ID : 등록되지 않은 시설 관리용 ID
  - ID : 각 시설의 고유 식별자 (Facility 참조)

- **Operating** (ID, OperateID) : 'Facility.ID'를 받아 'OperateID'에 시설 운영에 대한 식별 가능한 전체 정보를 저장하기 위한 기본 키 제공 테이블
  - ID: 각 시설의 고유 식별자 (Facility 참조)
  - OperateID: 각 시설에 대한 운영 정보가 포함된 식별 ID

- **OperatingDay** (OperateID, Mon, Tue, Wed, Thu, Fri, Sat, Sun) : 월요일부터 일요일까지 시설 운영 요일 정보를 담고 있는 테이블
  - OperateID: 각 시설에 대한 운영 정보가 포함된 식별 ID
  - Mon: 월요일 운영 시 "Open", 그렇지 않으면 "Close"
  - Tue: 'Mon'과 동일. 화요일에 Open 또는 Close
  - Wed: 수요일에 Open 또는 Close
  - Thu: 목요일에 Open 또는 Close
  - Fir: 금요일에 Open 또는 Close
  - Sat: 토요일에 Open 또는 Close
  - Sun: 일요일에 Open 또는 Close

- **Charge_Weekday** (OperateID, charge_weekday) : 평일 요금 정보를 담고 있는 테이블
  - OperateID: 식별 ID
  - charge_weekday: 평일 요금 명시

- **Charge_Weekend** (OperateID, charge_weekend) : 주말 요금 정보를 담고 있는 테이블
  - OperateID: 식별 ID
  - charge_weekend: 주말 요금 명시

- **Hours_Weekday** (OperateID, open_weekday, close_weekday) : 평일 운영 시간 정보를 담고 있는 테이블
  - OperateID: 식별 ID
  - open_weekday: 평일 개장 시간 명시
  - close_weekday: 평일 폐장 시간 명시

- **Hours_Weekend** (OperateID, open_weekend, close_weekend) : 주말 운영 시간 정보를 담고 있는 테이블
  - OperateID: 식별 ID
  - open_weekend: 주말 개장 시간 명시
  - close_weekend: 주말 폐장 시간 명시

- **Comment** (OperateID, comment) : 지정된 운영 요일, 요금, 운영 시간 외 추가 정보를 나타내는 테이블 (예: 친구와 함께 오시면 10% 할인)
  - OperateID: 식별 ID
  - comment: 시설에서 지정한 추가 정보

<br />

> 🔗 [상세 링크](https://github.com/sora0319/Pacility_Project/blob/main/Pocility_Final.pdf)  
> 🔗 [DB schema](https://github.com/sora0319/Pacility_Project/blob/main/project_plan.pdf)

<br />

### 🗓️ 개발 기간
 2021.04 ~ 2021.06 (2개월 )

<br />
