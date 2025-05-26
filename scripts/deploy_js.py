import os
import subprocess
from pathlib import Path
from dotenv import load_dotenv

def deploy_js():
    # Load environment variables
    load_dotenv()
    
    # Get DreamHost credentials from environment variables
    host = os.getenv('DREAMHOST_HOST')
    username = os.getenv('DREAMHOST_USERNAME')
    remote_path = '/home/brizol/z-photography.com'
    ssh_key = os.path.expanduser('~/.ssh/dreamhost_deploy_rsa')
    
    if not all([host, username]):
        print("Error: Missing DreamHost credentials in environment variables.")
        print("Please ensure DREAMHOST_HOST and DREAMHOST_USERNAME are set in your .env file")
        return False
    
    try:
        # Create the remote directory structure if it doesn't exist
        mkdir_cmd = f'ssh -i {ssh_key} {username}@{host} "mkdir -p {remote_path}/js"'
        subprocess.run(mkdir_cmd, shell=True, check=True)
        
        # Deploy the JavaScript files using rsync with SSH key
        rsync_cmd = f'rsync -av --delete -e "ssh -i {ssh_key}" js/ {username}@{host}:{remote_path}/js/'
        print(f"Deploying JavaScript files...")
        subprocess.run(rsync_cmd, shell=True, check=True)
        
        print("JavaScript deployment completed successfully!")
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"Error during deployment: {e}")
        return False

if __name__ == '__main__':
    deploy_js() 