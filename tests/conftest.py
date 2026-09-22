import os
os.environ['GOOGLE_API_KEY']='offline-test'
os.environ['PINECONE_API_KEY']='offline-test'
os.environ['PINECONE_INDEX_NAME']='offline-test'
os.environ.pop('ANTHROPIC_API_KEY',None)
