FROM python:3.10-slim

WORKDIR /app

# Cài đặt công cụ biên dịch
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --upgrade pip
# Cài đặt thư viện (có thể mất vài phút để build)
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5005
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "5005"]