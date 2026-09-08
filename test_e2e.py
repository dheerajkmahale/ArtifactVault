import os
from supabase import create_client, Client

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

print("Starting E2E Backend Flow Test...")

# 1. Sign up
email = "test_user@example.com"
password = "testpassword123"
print(f"Signing up user {email}...")
try:
    res = supabase.auth.sign_up({"email": email, "password": password})
    print("Signup successful.")
except Exception as e:
    print(f"Signup skipped (likely already exists): {e}")

# 2. Log in
print("Logging in...")
res = supabase.auth.sign_in_with_password({"email": email, "password": password})
if res.user:
    print("Login successful.")
else:
    print("Login failed.")

# 3. Create Artifact Record (Mocking Upload.tsx)
print("Inserting artifact record...")
artifact = supabase.table("artifacts").insert({
    "user_id": res.user.id,
    "title": "Test E2E Artifact",
    "description": "Uploaded via script",
    "original_image_url": "https://raw.githubusercontent.com/pytorch/hub/master/images/dog.jpg",
    "processing_status": "processing"
}).execute()

artifact_id = artifact.data[0]["id"]
print(f"Artifact created with ID: {artifact_id}")

# 4. Trigger Edge Function manually (since Storage triggers or frontend normally does this)
print("Triggering classify-artifact edge function...")
func_res = supabase.functions.invoke("classify-artifact", invoke_options={
    "body": {
        "artifactId": artifact_id,
        "imageUrl": "https://raw.githubusercontent.com/pytorch/hub/master/images/dog.jpg"
    }
})
print("Edge Function Response:", func_res.data)

# 5. Check DB for classification update
print("Checking DB for classification...")
final_artifact = supabase.table("artifacts").select("*").eq("id", artifact_id).execute()
print("Final Artifact Record:", final_artifact.data[0])
