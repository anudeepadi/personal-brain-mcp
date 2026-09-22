"""Generate ContextOS's original SVG identity and explanatory graphics."""
from pathlib import Path
from html import escape
ROOT=Path(__file__).resolve().parents[1]/'docs/assets'
ROOT.mkdir(parents=True,exist_ok=True)

def text(x,y,value,size=20,fill='#16234C',weight=400,mono=False,extra=''):
    family='monospace' if mono else 'Arial, Helvetica, sans-serif'
    return f'<text x="{x}" y="{y}" font-family="{family}" font-size="{size}" fill="{fill}" font-weight="{weight}" {extra}>{escape(value)}</text>'

def save(name,w,h,body,title,desc):
    (ROOT/name).write_text(f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-labelledby="title desc"><title id="title">{escape(title)}</title><desc id="desc">{escape(desc)}</desc>{body}</svg>\n')

def mark(x,y,scale=1,color='#4859F5'):
    return f'<g transform="translate({x} {y}) scale({scale})" fill="none" stroke="{color}" stroke-width="6" stroke-linecap="round"><path d="M-6-26 H-22 Q-30-26-30-18 V18 Q-30 26-22 26 H-6 M6-26 H22 Q30-26 30-18 V18 Q30 26 22 26 H6"/><path d="M-12-8 H12 M-12 8 H4"/></g>'

for theme in ['light','dark']:
    bg,ink,muted,rule,card=('#EFF2FD','#16234C','#5D698E','#D6DDF4','#FFFFFF') if theme=='light' else ('#111A35','#F0F3FF','#A5B2DC','#2D3A64','#1B2748')
    body=f'<rect width="1400" height="700" rx="24" fill="{bg}"/>'
    body+=mark(80,71,.49,'#7888FF' if theme=='dark' else '#4859F5')+text(118,78,'CONTEXTOS',20,ink,700,extra='letter-spacing="3"')
    body+=text(1336,77,'DOCUMENTS / CONVERSATIONS / CONTEXT',13,muted,mono=True,extra='text-anchor="end"')
    body+=f'<path d="M64 117 H1336 M64 602 H1336" stroke="{rule}"/>'
    body+=text(64,212,'KEEP THE THREAD.',15,muted,700,extra='letter-spacing="3"')
    body+=text(56,327,'ContextOS',102,ink,700,extra='letter-spacing="-5"')
    body+=text(64,397,'Your context, within reach.',35,ink)
    body+=text(64,442,'Save the conversation. Find the source.',25,muted)
    body+=f'<rect x="64" y="501" width="266" height="48" rx="8" fill="{ink}"/>'
    body+=text(84,531,'$ personal-brain-mcp',17,bg,mono=True)
    body+=text(64,648,'MCP SERVER  /  REST API  /  PYTHON',14,muted,mono=True)
    body+=text(1336,648,'Open source. Built on your knowledge.',16,muted,extra='text-anchor="end"')
    body+=f'<path d="M848 232 H918 Q955 232 955 282 V342 H1200 M838 449 H913 Q955 449 955 402 V342" fill="none" stroke="{rule}" stroke-width="3"/>'
    for x,y,label in [(800,174,'DOCUMENT'),(800,388,'CONVERSATION')]:
        body+=f'<rect x="{x+8}" y="{y+8}" width="179" height="122" rx="10" fill="{bg}" stroke="{rule}"/><rect x="{x}" y="{y}" width="179" height="122" rx="10" fill="{card}" stroke="{rule}"/>'
        body+=text(x+18,y+30,label,12,muted,700,mono=True)
        body+=f'<path d="M{x+18} {y+52} h139 M{x+18} {y+68} h117 M{x+18} {y+84} h130" stroke="{muted}" stroke-width="4" opacity=".4"/>'
    body+=f'<circle cx="1101" cy="343" r="128" fill="none" stroke="{rule}" stroke-dasharray="4 10"/>'
    body+='<rect x="1046" y="287" width="112" height="112" rx="24" fill="#4859F5"/>'+mark(1102,343,1.1,'#F0F3FF')
    body+='<circle cx="1229" cy="343" r="9" fill="#B7ED87"/>'
    body+=text(1102,452,'RETRIEVE WITH REFERENCES',11,muted,mono=True,extra='text-anchor="middle"')
    save(f'hero-{theme}.svg',1400,700,body,'ContextOS — your context, within reach','Documents and saved conversations feed retrieval through an MCP server and REST API. Package name: personal-brain-mcp.')
save('mark.svg',128,128,'<rect width="128" height="128" rx="28" fill="#4859F5"/>'+mark(64,64,1.3,'#F0F3FF'),'ContextOS mark','An open pair of brackets holds two lines of context.')
body='<rect width="1200" height="360" rx="18" fill="#111A35"/>'+text(40,48,'FROM SAVED MATERIAL TO USEFUL CONTEXT',14,'#A5B2DC',700,extra='letter-spacing="2"')
for x,num,title,lines in [(40,'01','Capture',['Upload a document.','Save or import a chat.']),(335,'02','Index',['Extract and chunk text.','Embed with Google.']),(630,'03','Retrieve',['Search Pinecone.','Return matching passages.']),(925,'04','Use',['Read through MCP or API.','Ask with source references.'])]:
    body+=f'<rect x="{x}" y="82" width="235" height="220" rx="10" fill="#1B2748" stroke="#2D3A64"/>'
    body+=text(x+20,122,num,15,'#B7ED87',700,mono=True)+text(x+20,169,title,23,'#F0F3FF',700)
    for i,line in enumerate(lines):body+=text(x+20,213+i*26,line,14,'#A5B2DC')
    if x<925:body+=f'<path d="M{x+246} 188 h30 l-6-6 m6 6 l-6 6" stroke="#A5B2DC" fill="none"/>'
save('workflow.svg',1200,360,body,'ContextOS retrieval workflow','Capture, index with Google embeddings, retrieve from Pinecone, then access passages and answers through MCP or REST.')
body='<rect width="1200" height="400" rx="18" fill="#EFF2FD"/>'+text(40,49,'TWO INTERFACES. ONE KNOWLEDGE WORKFLOW.',14,'#5D698E',700,extra='letter-spacing="2"')
for x,title,subtitle in [(40,'MCP clients','10 tools + 5 resource declarations'),(644,'REST + connected web UI','FastAPI endpoints + static frontend')]:
    body+=f'<rect x="{x}" y="80" width="516" height="100" rx="10" fill="#FFF" stroke="#D6DDF4"/>'
    body+=text(x+24,121,title,24,weight=700)+text(x+24,153,subtitle,16,'#5D698E')
    body+=f'<path d="M{x+258} 180 V212 H600 V240" stroke="#8997BD" fill="none"/>'
body+='<rect x="311" y="240" width="578" height="61" rx="10" fill="#4859F5"/>'+text(600,279,'Parse → Embed → Store → Search',23,'#FFF',extra='text-anchor="middle"')
body+=text(600,353,'Google embeddings · Pinecone storage · Gemini / optional Anthropic answers',16,'#5D698E',extra='text-anchor="middle"')
save('architecture.svg',1200,400,body,'ContextOS interfaces and services','MCP clients and the FastAPI web interface access parsing, embedding, storage, and search. Inference and vector storage use external providers.')
print('Generated five ContextOS SVG assets.')
