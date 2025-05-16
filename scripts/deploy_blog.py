import os
import subprocess
from pathlib import Path
from dotenv import load_dotenv

def deploy_blog():
    # Load environment variables
    load_dotenv()
    
    # Get DreamHost credentials from environment variables
    host = os.getenv('DREAMHOST_HOST')
    username = os.getenv('DREAMHOST_USERNAME')
    remote_path = '/home/brizol/z-photography.com'
    
    if not all([host, username]):
        print("Error: Missing DreamHost credentials in environment variables.")
        print("Please ensure DREAMHOST_HOST and DREAMHOST_USERNAME are set in your .env file")
        return False
    
    try:
        # Deploy blog files
        blog_path = Path('blog')
        if not blog_path.exists():
            print("Error: blog directory not found")
            return False
            
        # Create the remote directory structure if it doesn't exist
        mkdir_cmd = f'ssh {username}@{host} "mkdir -p {remote_path}/blog/posts"'
        subprocess.run(mkdir_cmd, shell=True, check=True)
        
        # Deploy the main blog files
        rsync_cmd = f'rsync -av --delete blog/ {username}@{host}:{remote_path}/blog/'
        print(f"Deploying blog files...")
        subprocess.run(rsync_cmd, shell=True, check=True)
        
        print("Blog deployment completed successfully!")
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"Error during deployment: {e}")
        return False

if __name__ == '__main__':
    deploy_blog() 