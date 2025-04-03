FROM python:3.12-slim

WORKDIR /app/app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ /app/app

ENV PYTHONPATH=/app/app

EXPOSE 8000

CMD ["python", "server.py"]