import wave, json, sys, re, numpy as np
from piper import PiperVoice, SynthesisConfig
SR=22050; FPS=30
v = PiperVoice.load("/home/claude/tts/en-us-libritts-high.onnx", config_path="/home/claude/tts/en-us-libritts-high.onnx.json")
SPK=int(sys.argv[2]) if len(sys.argv)>2 else 105
VIDEOS = {
 "ring": [
  ("Your crypto. On your finger.", "What if your crypto wallet was a ring?", 0.9),
  ("Tap to sign", "Tangem Ring is a hardware wallet. Tap it to your phone to approve a transaction.", 0.6),
  ("No battery. No cables.", "No battery, no cables, and it's water resistant.", 0.6),
  ("Ring + backup cards", "It comes with backup cards, so if you lose the ring, you can still restore access.", 0.6),
  ("Tangem Ring", "Check it out with our link. It's in the bio, and on Telegram.", 2.6),
 ],
 "card": [
  ("Not your keys, not your coins.", "Not your keys, not your coins.", 0.8),
  ("A hardware wallet in a card", "Tangem is a hardware wallet the size of a bank card. Your private keys stay offline, on the chip.", 0.6),
  ("Tap to sign", "Just tap the card to your phone to sign. No cables, no battery.", 0.6),
  ("2 or 3 cards in a set", "A set has two or three cards, so you can keep a backup in a separate place.", 0.6),
  ("10% off with our link", "Get ten percent off with our link. It's in the bio, and on Telegram.", 2.6),
 ],
 "bybit_signup": [
  ("New to crypto?", "New to crypto? Here's how to get started on Bybit, in three simple steps.", 0.6),
  ("Sign up", "Step one. Sign up with our link. The referral code is already filled in.", 0.6),
  ("Verify your ID", "Step two. Verify your identity. It usually takes just a few minutes.", 0.6),
  ("Explore rewards", "Step three. Check the new user rewards. Conditions apply.", 0.6),
  ("Pick your Bybit", "In Europe, use Bybit E U. Everywhere else, use Bybit Global. Both links are in the bio.", 2.6),
 ],
 "bybit_tradfi": [
  ("One account. More markets.", "One account. More markets. Bybit Global lets you trade traditional markets on MetaTrader 5.", 0.6),
  ("Trade with USDT", "Gold, forex, indices and U S stocks, funded with U S D T from your Bybit account.", 0.6),
  ("MT5 tools", "You get M T 5 charts, indicators, and expert advisors.", 0.6),
  ("Leveraged CFDs", "Remember, these are leveraged C F Ds. You can lose money fast. Not available in the E E A, U K, or U S.", 0.9),
  ("Sign up with code", "Sign up with our link. It's in the bio, and on Telegram.", 2.6),
 ]}
def synth(t):
    import io
    b=io.BytesIO()
    with wave.open(b,"wb") as w: v.synthesize_wav(t,w,syn_config=SynthesisConfig(speaker_id=SPK,length_scale=0.95,noise_scale=0.5,noise_w_scale=0.6))
    b.seek(0); w=wave.open(b); a=np.frombuffer(w.readframes(w.getnframes()),np.int16).astype(np.float32)/32768
    # trim silence
    idx=np.where(np.abs(a)>0.02)[0]; a=a[max(0,idx[0]-200):idx[-1]+400]
    return a
def music(n):
    t=np.arange(n)/SR; out=np.zeros(n,np.float32); bpm=96; beat=60/bpm
    chords=[[220,261.6,329.6],[174.6,220,261.6],[196,246.9,293.7],[164.8,207.7,246.9]]
    bar=beat*4
    for i,c in enumerate(chords*20):
        s=int(i*bar*SR); e=min(n,int((i+1)*bar*SR))
        if s>=n: break
        tt=t[s:e]-t[s]; env=np.minimum(1,tt/0.6)*np.minimum(1,(bar-tt)/0.6)
        for f in c: out[s:e]+=0.05*env*(np.sin(2*np.pi*f*tt)+0.3*np.sin(2*np.pi*2*f*tt))
    k=0
    while True:
        s=int(k*beat*SR)
        if s>=n: break
        L=min(int(0.25*SR),n-s); tt=np.arange(L)/SR
        out[s:s+L]+=0.35*np.sin(2*np.pi*(50+60*np.exp(-tt*30))*tt)*np.exp(-tt*9)
        h=int((k+0.5)*beat*SR)
        if h<n:
            Lh=min(int(0.05*SR),n-h); out[h:h+Lh]+=0.04*np.random.randn(Lh)*np.exp(-np.arange(Lh)/SR*80)
        k+=1
    # lowpass-ish smoothing
    out=np.convolve(out,np.ones(6)/6,'same')
    return out
for name,scenes in VIDEOS.items():
    if len(sys.argv)>1 and sys.argv[1] not in (name,'all'): continue
    voice=[]; meta=[]; cur=0.4
    for head,line,tail in scenes:
        a=synth(line); dur=len(a)/SR
        words=line.split(); w=[len(x)+1 for x in words]; tot=sum(w); acc=0; caps=[]
        for x,ww in zip(words,w):
            s=dur*acc/tot; acc+=ww; e=dur*acc/tot
            caps.append({"text":" "+x,"startMs":round((0.4+s)*1000),"endMs":round((0.4+e)*1000),"timestampMs":None,"confidence":None})
        sc=0.4+dur+tail; frames=int(round(sc*FPS))
        meta.append({"headline":head,"line":line,"frames":frames,"captions":caps})
        voice.append((cur,a)); cur+=frames/FPS
    n=int(cur*SR)+SR; mix=np.zeros(n,np.float32)
    for st,a in voice: s=int(st*SR); mix[s:s+len(a)]+=a*0.9
    m=music(n); env=np.ones(n)
    for st,a in voice: s=int(st*SR); env[max(0,s-2000):s+len(a)+2000]=0.45
    env=np.convolve(env,np.ones(4000)/4000,'same')
    mix+=m*env*0.8
    fo=int(1.5*SR); mix[-fo:]*=np.linspace(1,0,fo)
    mix=mix/max(1e-6,np.abs(mix).max())*0.89
    with wave.open(f"/home/claude/remo/tangem-remo/public/{name}_vo.wav","wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix*32767).astype(np.int16).tobytes())
    json.dump({"scenes":meta,"total":sum(s["frames"] for s in meta)},open(f"/home/claude/remo/tangem-remo/src/data/{name}.json","w"),indent=1)
    print(name,[s["frames"] for s in meta],sum(s["frames"] for s in meta)/FPS)
