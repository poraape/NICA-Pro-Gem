from celery import Celery

from app.core.config import settings

celery_app = Celery(
    "mas",
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend,
)

celery_app.conf.task_routes = {
    "agent.generate_plan": {"queue": "agents"},
    "app.tasks.ingest.*": {"queue": "ingest"},
    "app.tasks.*": {"queue": "default"},
}

celery_app.autodiscover_tasks(["app.tasks"])
