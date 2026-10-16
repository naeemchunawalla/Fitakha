// Preview routing: identifies need for review; does not grant medical clearance.
window.FitakhaHealth={
conditions:['High blood pressure (hypertension)','Low blood pressure / recurrent faintness','Heart disease, heart rhythm condition, or previous heart attack','Stroke or other vascular disease','Arthritis / ongoing joint condition','Osteoporosis, osteopenia, or previous fragility fracture','Diabetes','Asthma, COPD, or another lung condition','Kidney disease','Neurological condition or balance disorder','Other chronic condition'],
route(h){
if(h.symptoms==='1')return 'urgent';
if(h.symptoms!=='0'||h.restrictions!=='0'||h.control==='2')return 'pause';
if(!['0','1'].includes(h.history)||(h.conditions.length&&h.control!=='1'))return 'review';
if(h.medication!=='0'&&h.guidance!=='1')return 'review';
if(h.conditions.includes('5')&&(h.fracture!=='0'||h.guidance!=='1'))return 'review';
// These complex histories need a condition-specific plan beyond this starter preview.
if(h.conditions.some(c=>['1','2','3','6','8','9','10'].includes(c)))return 'review';
if(h.conditions.includes('7')&&h.guidance!=='1')return 'review';
return 'continue'},
summary(h){return ['Health history: '+(['No known conditions','Condition(s) reported','Not sure','Prefer not to say'][h.history]||'Not supplied'),...h.conditions.map(i=>this.conditions[Number(i)]).filter(Boolean),'Smoking: '+(['Never smoked','Former smoker','Current smoker','Prefer not to say'][h.smoking]||'Not supplied'),'Vaping: '+(['No','Yes','Prefer not to say'][h.vaping]||'Not supplied')].join(' · ')}
};
