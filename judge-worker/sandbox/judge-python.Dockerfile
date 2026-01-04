FROM python:3.11-alpine

# 1. Cài thư viện cần thiết
RUN apk add --no-cache bash coreutils

# 2. Tạo user (Alpine dùng adduser)
# -D: không đặt password, -h: set thư mục home là /sandbox
RUN adduser -D -h /sandbox judgeuser

# 3. [AN TOÀN] Chạy thêm lệnh này để đảm bảo 100% quyền sở hữu thuộc về judgeuser
# (Phòng trường hợp adduser chưa gán sạch sẽ hoặc cache bị lỗi)
RUN chown -R judgeuser:judgeuser /sandbox

# 4. Thiết lập user và thư mục làm việc
USER judgeuser
WORKDIR /sandbox

# 5. [QUAN TRỌNG] Giữ container luôn chạy (để chờ Worker vào chấm bài)
CMD ["sleep", "infinity"]