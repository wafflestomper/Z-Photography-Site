import os
import subprocess
from pathlib import Path
from dotenv import load_dotenv

def deploy_styles():
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
        mkdir_cmd = f'ssh -i {ssh_key} {username}@{host} "mkdir -p {remote_path}/styles"'
        subprocess.run(mkdir_cmd, shell=True, check=True)
        
        # Deploy the CSS files using rsync with SSH key
        rsync_cmd = f'rsync -av --delete -e "ssh -i {ssh_key}" styles/ {username}@{host}:{remote_path}/styles/'
        print(f"Deploying CSS files...")
        subprocess.run(rsync_cmd, shell=True, check=True)
        
        # Set correct permissions for the styles directory and files
        print("Setting correct permissions...")
        chmod_cmd = f'ssh -i {ssh_key} {username}@{host} "chmod 755 {remote_path}/styles && chmod 644 {remote_path}/styles/*.css"'
        subprocess.run(chmod_cmd, shell=True, check=True)
        
        print("CSS deployment completed successfully!")
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"Error during deployment: {e}")
        return False

if __name__ == '__main__':
    deploy_styles() 