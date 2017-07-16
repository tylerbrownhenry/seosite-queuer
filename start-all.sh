node server &
cd ../
cd seosite-dashboard
grunt start &
cd ../
cd seosite-queue
cd ../
cd dynamo-panel
npm run-script dev &
cd ~
cd ../../usr/local/sbin/
la

# java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb -port 9000
