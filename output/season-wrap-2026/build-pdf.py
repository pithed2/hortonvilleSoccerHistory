import json, pathlib, shutil
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor,white
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph,Table,TableStyle
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.utils import ImageReader
import pypdfium2 as pdfium
D=json.loads(pathlib.Path('data/season-wrap-2026.json').read_text())
C=D['classOf2027'];W=612;H=792;M=44;CW=W-2*M
RED=HexColor('#B70D28');INK=HexColor('#171C23');MUTED=HexColor('#526170');LINE=HexColor('#D8DEE5');LIGHT=HexColor('#F5F7F9')
for name,file in [('Body','arial.ttf'),('Bold','arialbd.ttf'),('Display','ARIALNB.TTF')]:pdfmetrics.registerFont(TTFont(name,'C:/Windows/Fonts/'+file))
pdfmetrics.registerFontFamily('Body',normal='Body',bold='Bold',italic='Body',boldItalic='Bold')
styles={}
for name,font,size,color in [('body','Body',10,INK),('small','Body',8.4,MUTED),('white','Body',10,white),('label','Bold',9,MUTED)]:styles[name]=ParagraphStyle(name,fontName=font,fontSize=size,leading=size*1.42,textColor=color)
path=pathlib.Path('output/pdf/class-of-2027-final-season-breakout.pdf');path.parent.mkdir(parents=True,exist_ok=True)
c=canvas.Canvas(str(path),pagesize=(W,H));c.setTitle('Class of 2027 | Hortonville Boys Soccer | Final season edition');c.setAuthor('Hortonville Boys Soccer')
def txt(x,y,t,size=10,font='Body',color=INK):
 c.setFillColor(color);c.setFont(font,size);c.drawString(x,y,t)
def para(x,y,text,width=CW,style='body'):
 p=Paragraph(text,styles[style]);_,h=p.wrap(width,900);p.drawOn(c,x,y-h);return y-h

def footer(page):
 c.setStrokeColor(LINE);c.line(M,35,W-M,35);txt(M,22,'HORTONVILLE BOYS SOCCER  /  FINAL EDITION - OCTOBER 30, 2026',7,'Bold',MUTED);txt(W-M-8,22,str(page),8,'Bold',MUTED)
def header(title,subtitle):
 txt(M,744,title,31,'Display');return para(M,727,subtitle,style='small')
def metric(x,y,w,h,label,value,rank,detail):
 c.setStrokeColor(LINE);c.rect(x,y-h,w,h,fill=0,stroke=1)
 txt(x+12,y-21,label,8,'Bold',MUTED);txt(x+12,y-58,value,30,'Display')
 txt(x+12,y-76,rank,8,'Bold',RED);para(x+12,y-87,detail,w-24,'small')
def rank(key,lower=False):return 1+sum((w[key]<C[key] if lower else w[key]>C[key]) for w in D['windows'])
# Page 1: the updated class story and six comparisons.
c.drawImage('public/logos/vintage-soccer-logo.png',M,657,width=78,height=90,mask='auto',preserveAspectRatio=True,anchor='c')
txt(136,737,'HORTONVILLE POLAR BEARS - BOYS VARSITY',8,'Bold',MUTED)
txt(136,692,'CLASS OF',44,'Display');txt(353,692,'2027',54,'Display',RED)
txt(M,620,'63W - 10L - 12T',39,'Display')
y=para(M,600,'Four seasons. A new standard. The most wins and highest win percentage of any documented four-year class in program history.',style='body')
y=para(M,y-10,'Final totals include all 2026 postseason matches. Compared with 19 graduating classes, Class of 2009 through Class of 2027.',style='small')
c.setFillColor(RED);c.rect(M,450,CW,61,fill=1,stroke=0);txt(M+13,466,'27',37,'Display',white)
para(M+76,495,'Straight FVA matches without a loss: <b>20 wins, 7 ties.</b><br/>Their last conference defeat was October 3, 2023, as freshmen.',CW-92,'white')
txt(M,426,'THE FOUR-YEAR BENCHMARK',22,'Display')
w=(CW-16)/3
metrics=[('OVERALL WINS','63','#1 OF 19','Ten more than the next class: 53, Class of 2026.'),('WIN PERCENTAGE','74.1%','#1 OF 19','Next: 62.4%, Class of 2026. Wins divided by games played.'),('CONFERENCE RECORD','24-3-9','#1 POINTS PERCENTAGE','79.2% of available conference points (2 per win, 1 per tie).'),('GOALS SCORED','283','#1 OF 19','Six ahead of Class of 2015 (277). 3.33 goals per match.'),('GOALS ALLOWED','61','FEWEST OF 19','Next fewest: 62, Class of 2026. Just 0.72 allowed per match.'),('CLEAN SHEETS','44','TIED #1 OF 19','Matches Class of 2026. The Regional-final shutout secured the tie.')]
for i,m in enumerate(metrics):metric(M+(i%3)*(w+8),407-(i//3)*155,w,145,*m)
footer(1);c.showPage()
# Page 2: historical chart, season table and playoff legacy.
y=header('THE HIGH-WATER MARK','Four-season win percentage by graduating class. Every class is measured the same way: wins divided by all completed matches.')
chartY=633;chartH=70;chartX=M+9;step=(CW-15)/19;barW=step-7
for cl in D['windows']:
 i=cl['classYear']-2009;x=chartX+i*step;height=chartH*cl['winPct']/80
 c.setFillColor(RED if cl['classYear']==2027 else HexColor('#788492'));c.rect(x,chartY,barW,height,fill=1,stroke=0)
 txt(x,chartY-14,str(cl['classYear'])[-2:],7,'Bold',MUTED)
 if cl['classYear'] in [2015,2026,2027]:txt(x-1,chartY+height+6,f"{cl['winPct']:.1f}",7,'Bold',RED if cl['classYear']==2027 else MUTED)
c.setStrokeColor(LINE);c.line(M,chartY,W-M,chartY)
para(M,599,'The Class of 2027 is the first documented class above 65% and finishes nearly 12 percentage points above the next-best four-year group.',style='small')
txt(M,549,'FRESHMAN TO SENIOR',24,'Display')
data=[['Season','Overall','Win %','FVA','GF / GA','Shutouts','Postseason']]
for r in D['seasons']:
 conf=r['conference'];post=r['postseason'];record=lambda a:f"{a['w']}-{a['l']}-{a['t']}"
 data.append([str(r['year']),record(r),f"{r['winPct']:.1f}%",record(conf),f"{r['gf']} / {r['ga']}",str(r['shutouts']),record(post)])
data.append(['TOTAL','63-10-12','74.1%','24-3-9','283 / 61','44','8-3-1'])
t=Table(data,colWidths=[55,83,58,80,70,75,103])
t.setStyle(TableStyle([('FONTNAME',(0,0),(-1,0),'Bold'),('FONTNAME',(0,1),(-1,-1),'Body'),('FONTSIZE',(0,0),(-1,-1),8.4),('LEADING',(0,0),(-1,-1),11),('TOPPADDING',(0,0),(-1,-1),10),('BOTTOMPADDING',(0,0),(-1,-1),10),('BACKGROUND',(0,0),(-1,0),INK),('TEXTCOLOR',(0,0),(-1,0),white),('BACKGROUND',(0,-1),(-1,-1),LIGHT),('FONTNAME',(0,-1),(-1,-1),'Bold'),('LINEBELOW',(0,0),(-1,-1),.5,LINE),('TEXTCOLOR',(0,1),(-1,-1),INK)]));_,th=t.wrap(CW,900);t.drawOn(c,M,529-th)
y=529-th-20
y=para(M,y,'<b>2023:</b> Regional champions in Division 2. <b>2024:</b> First year of this stretch in Division 1. <b>2025:</b> Unbeaten 20-0-4, shared FVA title and a sectional-final appearance (eliminated on penalties). <b>2026:</b> Outright FVA and Regional champions; Division 1 sectional semifinal.',style='small')
y-=24;txt(M,y,'A POSTSEASON STANDARD',22,'Display');y-=20
y=para(M,y,'<b>12 postseason matches and 8 postseason wins:</b> both the most of any of the 19 four-year windows. The previous high was 10 matches and 6 wins, Class of 2026.')
y=para(M,y-13,'<b>Two FVA championships:</b> 2025 (shared) and 2026 (outright). Three Regional titles during their four seasons: 2023, 2025 and 2026.')
y=para(M,y-13,'<b>24 conference wins:</b> fifth among the 19 classes. Older Bay Conference schedules offered more league matches; the nine-match FVA schedule makes points percentage the fairer comparison.',style='small')
footer(2);c.showPage()
# Page 3: individual legacy, all seniors and transparent methods.
y=header('NAMES ON THE BOARD','Four seniors occupy eight top-ten places across the recorded career goals, assists, points and saves lists. Rankings include the final 2026 match.')
leaderDetails=[('ROMAN GLAD','60 goals - #1  |  147 points - #1','27 assists - #5'),('JACOB PLUTZ','30 assists - #4','78 points - #11'),('NOAH RINDT','29 goals - #10  |  81 points - #10','23 assists - tied #8'),('ELI RYAN','75 saves - #7','Five saves in the final match at De Pere')]
y=687
for name,line1,line2 in leaderDetails:
 txt(M,y,name,21,'Display',RED);txt(M,y-22,line1,11,'Bold');txt(M,y-40,line2,10,'Body',MUTED);c.setStrokeColor(LINE);c.line(M,y-54,W-M,y-54);y-=78
txt(M,y-4,'THANK YOU, SENIORS.',24,'Display');y-=25
names=[r['player_name'] for r in D['seniors']]
y=para(M,y,', '.join(names)+'.',style='body')
y=para(M,y-11,'The records belong to the whole group: the finishes and final passes, the defending, the saves, the training standards and the teammates who kept raising them. Two conference titles and three Regional titles are the public markers of four years of shared work.',style='body')
y-=23;txt(M,y,'FINAL 2026 SEASON',18,'Display');y-=14
y=para(M,y,'16-2-1 overall. 8-0-1 in the FVA. 70 goals scored, 19 conceded and seven shutouts. A 1-0 Regional-final win over Green Bay Preble, followed by a 3-0 sectional-semifinal loss at De Pere on October 29.',style='small')
y-=20;txt(M,y,'SOURCES AND COUNTING',11,'Bold');y-=10
notes='Class of 2027 = seasons 2023-2026; comparable windows run from Class of 2009 (2005-2008) through 2027. Results for 2003-2004 are not documented. Records, goals, clean sheets and postseason counts are recalculated from the site game archive. A draw decided on penalties remains a draw. Conference points percentage uses 2 for a win, 1 for a draw; the 2020 league was the Wisconsin Valley alignment. Career lists cover recorded statistics from 2007 forward; earlier classes are undercounted. Scoring totals through October 24 remain final after the scoreless October 29 match. Goalkeeper figures include that final box score.'
y=para(M,y,notes,style='small')
y=para(M,y-8,'Source archive: Hortonville Boys Soccer, refreshed October 30, 2026. <link href="https://www.maxpreps.com/print/contest_stats.aspx?ContestId=25d4cb0f-4d27-4903-826c-58d0f53df8b7&amp;ssid=ca5a6045-d072-443c-85de-08ce0e287273" color="#B70D28">Final-match box score (MaxPreps)</link>. <link href="https://tournaments.wiaawi.org/brackets/Soccer/Boys/2026/2026_Soccer_Boys_Div1_Sec1_2" color="#B70D28">Official WIAA bracket</link>.',style='small')
assert y>45, y
footer(3);c.save()
public=pathlib.Path('public/documents/class-of-2027-final-season-breakout.pdf');public.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(path,public)
pdf=pdfium.PdfDocument(str(path))
for i,page in enumerate(pdf):page.render(scale=1.5).to_pil().save(f'output/season-wrap-2026/class-of-2027-page-{i+1}.png')
pathlib.Path('public/images').mkdir(exist_ok=True)
shutil.copyfile('output/season-wrap-2026/class-of-2027-page-1.png','public/images/class-of-2027-final-season-breakout.png')
print(path.resolve(), 'pages',len(pdf),'last text baseline',y)
