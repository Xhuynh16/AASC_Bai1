# Ứng dụng Bitrix24 OAuth

## Giới thiệu
Ứng dụng này tích hợp với Bitrix24 thông qua REST API, sử dụng OAuth 2.0 để xác thực. Ứng dụng hỗ trợ các chức năng sau:
- Nhận sự kiện **Install App** khi ứng dụng được cài đặt hoặc cài đặt lại trên Bitrix24.
- Thực hiện luồng xác thực OAuth 2.0 để lấy và lưu **access token** và **refresh token**.
- Làm mới token khi hết hạn.
- Gọi API Bitrix24 (ví dụ: lấy danh sách contacts) và xử lý các lỗi cơ bản (timeout, token expired, network error).

Ứng dụng được viết bằng **Node.js** và sử dụng **Express.js** làm framework web. **Ngrok** được sử dụng để tạo tunnel công khai, cho phép Bitrix24 gửi yêu cầu đến backend chạy trên máy local.

## Yêu cầu hệ thống
- **Node.js** (phiên bản 14 trở lên) và **npm** đã được cài đặt.
- Tài khoản Bitrix24 với **quyền quản trị viên** (để tạo và cài đặt ứng dụng cục bộ).
- **Ngrok** để tạo tunnel công khai (tải tại [ngrok.com/download](https://ngrok.com/download)).
- Hệ điều hành: Windows, macOS, hoặc Linux.
- Trình duyệt web (như Chrome, Firefox) để kiểm tra ứng dụng.

## Cài đặt ứng dụng

### 1. Clone repository
Tải mã nguồn về máy tính của bạn:
```bash
git clone <repository-url>
cd bitrix-oauth
```

### 2. Cài đặt các dependencies
Chạy lệnh sau để cài đặt các gói cần thiết:
```bash
npm install
```

### 3. Cài đặt và chạy ngrok
- Tải ngrok từ [ngrok.com/download](https://ngrok.com/download) và cài đặt theo hướng dẫn.
- Đăng ký tài khoản ngrok miễn phí để nhận authtoken (nếu chưa có).
- Cấu hình authtoken:
  ```bash
  ngrok authtoken <your-auth-token>
  ```
- Mở một terminal mới và chạy ngrok để tạo tunnel đến cổng 3000 (cổng mặc định của backend):
  ```bash
  ngrok http 3000
  ```
- Lấy URL ngrok được tạo ra (ví dụ: `https://abcd1234.ngrok.io`) và ghi lại. URL này sẽ được sử dụng trong các bước tiếp theo.

### 4. Cấu hình ứng dụng
Tạo file `.env` trong thư mục gốc của project (bitrix-oauth/) và điền các thông tin sau:
```
PORT=3000
CLIENT_ID=<client-id>
CLIENT_SECRET=<client-secret>
BITRIX_DOMAIN=<your-domain>.bitrix24.com
REDIRECT_URI=https://<ngrok-url>
```
**Giải thích:**
- `PORT`: Cổng mà backend Node.js chạy (mặc định là 3000).
- `CLIENT_ID` và `CLIENT_SECRET`: Lấy từ ứng dụng cục bộ trên Bitrix24 (xem bước 5).
- `BITRIX_DOMAIN`: Tên miền Bitrix24 của bạn (ví dụ: `mycompany.bitrix24.com`).
- `REDIRECT_URI`: URL ngrok vừa lấy ở bước 3 (ví dụ: `https://abcd1234.ngrok.io`).

**Ví dụ file .env hoàn chỉnh:**
```
PORT=3000
CLIENT_ID=local.1234567890abcdef
CLIENT_SECRET=secret1234567890
BITRIX_DOMAIN=mycompany.bitrix24.com
REDIRECT_URI=https://abcd1234.ngrok.io
```

### 5. Tạo và cấu hình ứng dụng cục bộ trên Bitrix24
- Đăng nhập vào Bitrix24 với tài khoản quản trị viên.
- Vào **Ứng dụng > Developer Resources > Other > Local Application** (trong menu bên trái).
- Tạo một ứng dụng mới với các thông tin sau:
  - **Tiêu đề**: OAuth Test App.
  - **Loại ứng dụng**: Mấy chủ (Server).
  - **Bường dẫn xử lý cài đặt ban đầu**: `https://<ngrok-url>` (ví dụ: `https://abcd1234.ngrok.io`).
  - **Bường dẫn xử lý cài đặt dữ liệu**: `https://<ngrok-url>/install` (ví dụ: `https://abcd1234.ngrok.io/install`).
  - **Chỉ kích hoạt (Không giao diện người dùng)**: Check.
  - **Quyền truy cập**: Chọn CRM (crm) và Người dùng (user).
  - **Văn bản mục menu Tiếng Việt**: OAuth Test Menu (giá trị này không quan trọng vì không có giao diện).
- Nhấn **LƯU** để lưu ứng dụng.
- Ghi lại Client ID và Client Secret được hiển thị, sau đó cập nhật vào file `.env` (các giá trị `CLIENT_ID` và `CLIENT_SECRET`).
- Nhấn **Install** hoặc **Reinstall** để kích hoạt ứng dụng. Bitrix24 sẽ gửi yêu cầu POST đến `/install` để lưu token ban đầu.

### 6. Khởi động ứng dụng
Mở terminal trong thư mục project (bitrix-oauth/) và chạy lệnh sau để khởi động server:
```bash
npm start
```
Nếu không có lỗi, bạn sẽ thấy thông báo:
```
Server running on port 3000
```
Đảm bảo ngrok vẫn đang chạy trong terminal khác (bước 3).

## Kiểm tra (Test) ứng dụng
Ứng dụng hỗ trợ các chức năng chính: xác thực OAuth, nhận sự kiện Install App, làm mới token, và gọi API. Dưới đây là các bước kiểm tra từng chức năng.

### 1. Kiểm tra sự kiện Install App
**Mục tiêu**: Xác nhận rằng ứng dụng có thể nhận và lưu token khi được cài đặt trên Bitrix24.
- **Thao tác**:
  - Trên Bitrix24, vào **Developer Resources > Local Applications**, tìm ứng dụng "OAuth Test App".
  - Nhấn **Reinstall** để kích hoạt lại ứng dụng.
  - Bitrix24 sẽ gửi yêu cầu POST đến `https://<ngrok-url>/install`.
- **Kết quả mong đợi**:
  - Mở file `tokens.json` trong thư mục gốc của project (bitrix-oauth/tokens.json).
  - Kiểm tra xem file có chứa thông tin token hay không. Ví dụ:
    ```json
    {
      "access_token": "abc123...",
      "expires": 1696112345,
      "refresh_token": "def456...",
      "domain": "mycompany.bitrix24.com",
      "member_id": "xyz789..."
    }
    ```
  - Nếu file `tokens.json` được tạo và chứa thông tin token, chức năng này hoạt động đúng.

### 2. Kiểm tra luồng xác thực OAuth
**Mục tiêu**: Xác nhận rằng ứng dụng có thể thực hiện luồng OAuth 2.0 để lấy token mới.
- **Thao tác**:
  - Mở trình duyệt và truy cập URL ngrok (ví dụ: `https://abcd1234.ngrok.io`).
  - Ứng dụng sẽ chuyển hướng bạn đến trang xác thực của Bitrix24.
  - Đăng nhập (nếu cần) và cấp quyền cho ứng dụng.
  - Sau khi xác thực, bạn sẽ được chuyển hướng về URL ngrok và thấy thông báo:
    ```
    Authorization successful!
    ```
- **Kết quả mong đợi**:
  - Mở file `tokens.json` và kiểm tra xem token có được cập nhật hay không (thời gian expires sẽ thay đổi).
  - Nếu thấy thông báo "Authorization successful!" và token được cập nhật, luồng OAuth hoạt động đúng.

### 3. Kiểm tra làm mới token
**Mục tiêu**: Xác nhận rằng ứng dụng có thể làm mới access token khi hết hạn.
- **Thao tác**:
  - Mở file `tokens.json` và chỉnh sửa giá trị expires thành một thời điểm trong quá khứ (ví dụ: 1696112345).
  - Truy cập endpoint làm mới token: `https://<ngrok-url>/token/refresh`.
- **Kết quả mong đợi**:
  - Bạn sẽ nhận được phản hồi JSON:
    ```json
    {
      "message": "Token refreshed",
      "tokens": {
        "access_token": "new-access-token",
        "expires": 1696115945,
        "refresh_token": "new-refresh-token",
        "domain": "mycompany.bitrix24.com",
        "member_id": "xyz789..."
      }
    }
    ```
  - Mở file `tokens.json` và kiểm tra xem token đã được cập nhật với giá trị mới hay không.
  - Nếu token được làm mới thành công, chức năng này hoạt động đúng.

### 4. Kiểm tra gọi API (lấy danh sách contacts)
**Mục tiêu**: Xác nhận rằng ứng dụng có thể gọi API Bitrix24 và xử lý lỗi (như token expired).
- **Thao tác**:
  - Truy cập endpoint gọi API: `https://<ngrok-url>/api/contacts`.
  - Endpoint này sẽ gọi API `crm.contact.list` để lấy danh sách contacts từ Bitrix24.
- **Kết quả mong đợi**:
  - Bạn sẽ nhận được phản hồi JSON chứa danh sách contacts:
    ```json
    {
      "result": [
        { "ID": "1", "NAME": "Test Contact 1", "EMAIL": "test1@example.com" },
        { "ID": "2", "NAME": "Test Contact 2", "EMAIL": "test2@example.com" },
        ...
      ],
      "total": 2,
      "time": { ... }
    }
    ```
  - Nếu token hết hạn, ứng dụng sẽ tự động làm mới token và thử lại, sau đó trả về kết quả như trên.
  - Nếu không có contacts nào khớp với bộ lọc (NAME: 'Test%'), bạn sẽ nhận được mảng rỗng:
    ```json
    { "result": [], "total": 0, "time": { ... } }
    ```
  - Nếu chức năng này hoạt động đúng, bạn sẽ thấy danh sách contacts hoặc mảng rỗng (tùy dữ liệu trên Bitrix24).

### 5. Kiểm tra xử lý lỗi
**Mục tiêu**: Xác nhận rằng ứng dụng xử lý đúng các lỗi như timeout, token expired, và network error.
- **Thao tác**:
  - **Kiểm tra token expired**:
    - Đã kiểm tra ở bước 3 (làm mới token). Khi gọi `/api/contacts` với token hết hạn, ứng dụng sẽ tự động làm mới token và trả về kết quả.
  - **Kiểm tra network error**:
    - Tắt kết nối internet trên máy tính và truy cập `https://<ngrok-url>/api/contacts`.
    - Bạn sẽ nhận được lỗi:
      ```
      Error: Network Error
      ```
  - **Kiểm tra timeout**:
    - Chỉnh sửa file `routes/api.js`, giảm timeout xuống 1 giây:
      ```javascript
      const response = await axios.get(..., { timeout: 1000 });
      ```
    - Gọi lại `/api/contacts`. Nếu API Bitrix24 phản hồi chậm, bạn sẽ nhận được lỗi:
      ```
      Error: timeout of 1000ms exceeded
      ```
- **Kết quả mong đợi**:
  - Ứng dụng trả về thông báo lỗi rõ ràng cho từng trường hợp (network error, timeout).
  - Nếu token hết hạn, ứng dụng tự động làm mới token và thử lại.

## Các endpoint có sẵn

| Endpoint         | Phương thức | Mô tả                                           |
|------------------|-------------|-------------------------------------------------|
| `/`              | GET         | Trang chủ, xử lý luồng OAuth.                   |
| `/install`       | POST        | Nhận và lưu token khi cài đặt ứng dụng.        |
| `/token/refresh` | GET         | Làm mới access token.                           |
| `/api/contacts`  | GET         | Lấy danh sách contacts từ Bitrix24 (API test). |

## Xử lý lỗi thường gặp

- **Invalid redirect_uri**:
  - Kiểm tra xem `REDIRECT_URI` trong `.env` có khớp với URL ngrok đã đăng ký trong Bitrix24 không.
  - Đảm bảo URL trong Bitrix24 (Handler Path và Install Script Path) khớp với `REDIRECT_URI`.

- **Cannot connect to server**:
  - Kiểm tra xem ngrok có đang chạy không (`ngrok http 3000`).
  - Đảm bảo server Node.js đang chạy (`npm start`).
  - Kiểm tra kết nối internet.

- **Token expired**:
  - Truy cập `/token/refresh` để làm mới token.
  - Kiểm tra file `tokens.json` để đảm bảo token được lưu đúng.

- **Network error**:
  - Kiểm tra kết nối internet.
  - Đảm bảo Bitrix24 không chặn yêu cầu (kiểm tra quyền truy cập trong ứng dụng cục bộ).

- **Timeout**:
  - Tăng giá trị timeout trong `routes/api.js` (mặc định là 30 giây) nếu cần:
    ```javascript
    const response = await axios.get(..., { timeout: 60000 });
    ```

## Ghi chú quan trọng

- **URL ngrok thay đổi**:
  - Với ngrok miễn phí, mỗi lần chạy `ngrok http 3000`, bạn sẽ nhận được một URL mới (ví dụ: `https://xyz7890.ngrok.io`).
  - Cập nhật URL mới vào:
    - File `.env` (`REDIRECT_URI`).
    - Ứng dụng cục bộ trên Bitrix24 (Handler Path và Install Script Path).
    - Nhấn **Reinstall** trên Bitrix24 để áp dụng thay đổi.

- **Lưu trữ token**:
  - Token hiện được lưu trong file `tokens.json`. Trong môi trường production, bạn nên lưu vào database (như MongoDB) và mã hóa token.

- **Quyền truy cập**:
  - Đảm bảo ứng dụng cục bộ trên Bitrix24 có đủ quyền (crm, user) để gọi API như `crm.contact.list`. 