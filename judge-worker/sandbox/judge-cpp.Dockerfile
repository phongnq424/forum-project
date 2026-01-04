FROM gcc:12

# 1. Cài đặt thư viện (Giữ nguyên)
RUN apt-get update && apt-get install -y \
    coreutils \
 && rm -rf /var/lib/apt/lists/*

# 2. Tạo user TRƯỚC
RUN useradd -m judgeuser

# 3. Tạo thư mục VÀ chuyển quyền sở hữu ngay lập tức
# mkdir -p: tạo thư mục
# chown -R: chuyển toàn bộ quyền sở hữu thư mục này cho judgeuser
RUN mkdir -p /sandbox && chown -R judgeuser:judgeuser /sandbox

# 4. Thiết lập thư mục làm việc (Lúc này /sandbox đã là nhà của judgeuser)
WORKDIR /sandbox

# 5. Chuyển sang user judgeuser
USER judgeuser

# 6. QUAN TRỌNG: Giữ container luôn chạy
# Nếu không có dòng này, container chạy xong sẽ tắt ngay lập tức, Worker không kịp làm gì cả.
CMD ["sleep", "infinity"]