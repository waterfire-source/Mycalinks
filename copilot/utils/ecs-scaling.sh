# productionのitem worker
aws ecs update-service \
  --cluster pos-production-Cluster-iNO5K40WGvQh \
  --service pos-production-worker-item-Service-YoKEBSttiK8T \
  --desired-count 2

aws ecs update-service \
  --cluster pos-staging-Cluster-gXKNGenFjPGO \
  --service pos-staging-worker-item-Service-i4jimHlDilXu \
  --desired-count 1

aws ecs update-service \
  --cluster pos-staging-Cluster-gXKNGenFjPGO \
  --service pos-staging-worker-notification-Service-BnixkR7faKrj \
  --desired-count 1

aws ecs update-service \
  --cluster pos-staging-Cluster-gXKNGenFjPGO \
  --service pos-staging-worker-product-Service-Q3WatTDGxpwl \
  --desired-count 0


aws ecs update-service \
  --cluster pos-staging-Cluster-gXKNGenFjPGO \
  --service pos-staging-worker-external-ec-Service-wj2B2FjZf8Gq \
  --desired-count 0


aws ecs update-service \
  --cluster pos-staging-Cluster-gXKNGenFjPGO \
  --service pos-staging-backend-outbox-Service-kESfBdK30xaI \
  --desired-count 0




aws ecs update-service \
  --cluster website-staging-Cluster-DzPsuJwBfUNk \
  --service website-staging-website-Service-tG8z8AjEzMLb \
  --desired-count 0