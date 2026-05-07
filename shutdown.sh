CONTAINERS=$(docker ps -q)
[ -n "$CONTAINERS" ] && docker kill $CONTAINERS || echo "No containers running."
