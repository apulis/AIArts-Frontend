 # Apulis AIArts Frontend

## Quick Start

1. Be sure to update the lastest code 
   
   `git pull origin master `

2. Buid the docker images
    
   ```
   docker build -t apulistech/ai-arts-frontend .
   # Turn up the compose services 
   docker-compose up -d
   # Turn down services
   docker-compose down
   ```

## Update the kubenates domain nginx configuration

   Add the services port into nginx conf
   ```
   location /AIarts {
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_buffers 16 16k;
       proxy_buffer_size 32k;
       proxy_pass http://localhost:3084/;
   }
   ```
