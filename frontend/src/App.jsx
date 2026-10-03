import React,{useEffect,useMemo,useState} from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Search,
  Database,
  Grid2X2,
  Sparkles,
  History,
  KeyRound,
  Archive,
  Bot,
  Settings as SettingsIcon,
  Users,
  Table2,
  Activity,
  Clock3,
  LogOut,
  Plus,
  Trash2,
  Edit3,
  RefreshCw,
  Upload,
  Save,
  MessageSquare,
  CheckCircle2,
  Download,
  Printer,
  Mic,
  MicOff,
  Bell,
  Lock
} from 'lucide-react';
class PageErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.page !== this.props.page && this.state.hasError) {
      this.setState({
        hasError: false,
        error: null,
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="panel">
          <div className="alert error">
            This page could not be displayed.
          </div>

          <p style={{ marginTop: '10px', opacity: 0.75 }}>
            The application recovered from a page error. Please use the
            navigation menu to continue.
          </p>

          <button
            className="primary"
            onClick={() =>
              this.setState({
                hasError: false,
                error: null,
              })
            }
          >
            Try Again
          </button>

          <pre
            style={{
              marginTop: '12px',
              whiteSpace: 'pre-wrap',
              fontSize: '12px',
              opacity: 0.65,
            }}
          >
            {String(this.state.error?.message || '')}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

const API=import.meta.env.VITE_API_URL||'http://127.0.0.1:8000/api';
function usePersistedState(key, initial){const storageKey=(()=>{try{const u=JSON.parse(localStorage.getItem('aiqpg_user')||'null');return `aiqpg_${u?.id??u?.email??'guest'}_${key}`}catch{return `aiqpg_guest_${key}`}})();const [value,setValue]=useState(()=>{try{const saved=localStorage.getItem(storageKey);return saved!==null?JSON.parse(saved):typeof initial==='function'?initial():initial}catch{return typeof initial==='function'?initial():initial}});useEffect(()=>{try{localStorage.setItem(storageKey,JSON.stringify(value))}catch{}},[storageKey,value]);return [value,setValue]}

async function api(path,opts={}){const token=localStorage.getItem('aiqpg_token');const headers={...(opts.body instanceof FormData?{}:{'Content-Type':'application/json'}),...(opts.headers||{})};if(token)headers.Authorization=`Bearer ${token}`;const r=await fetch(API+path,{...opts,headers});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(typeof d.detail==='string'?d.detail:JSON.stringify(d.detail||d));return d}
const FACULTY_NAV=[['Dashboard',LayoutDashboard],['Subject Management',BookOpen],['Syllabus Analyzer',Search],['Question Bank',Database],['Blueprint Designer',Grid2X2],['AI Paper Generator',Sparkles],['Previous Paper Analyzer',History],['Answer Key Generator',KeyRound],['Paper Vault',Archive],['AI Exam Assistant',Bot],['Settings',SettingsIcon]];
const ADMIN_NAV=[['Dashboard',LayoutDashboard],['User Management',Users],['Database Console',Table2],['Activity Logs',Activity],['Login Sessions',Clock3],['Settings',SettingsIcon]];
function Field({label,children}){return <label className="field"><span>{label}</span>{children}</label>}
function Module({title,subtitle,actions,children}){return <div className="panel"><div className="module-head"><div><span className="eyebrow">AIQPG MODULE</span><h1>{title}</h1><p>{subtitle}</p></div>{actions}</div>{children}</div>}
function Empty({text='No records found.'}){return <div className="empty">{text}</div>}
function Table({rows=[],cols=[]}){return <div className="table-wrap"><table><thead><tr>{cols.map(c=><th key={c}>{c.replaceAll('_',' ')}</th>)}</tr></thead><tbody>{rows.map((r,i)=><tr key={r.id??i}>{cols.map(c=><td key={c}>{String(r[c]??'—').slice(0,240)}</td>)}</tr>)}</tbody></table>{!rows.length&&<Empty/>}</div>}

function Auth({onLogin}){
 const[mode,setMode]=useState('signup'),[f,setF]=useState({name:'',email:'',password:'',role:'faculty',admin_code:'',otp:'',new_password:''}),[msg,setMsg]=useState(''),[error,setError]=useState(''),[loading,setLoading]=useState(false);
 const change=e=>{setF({...f,[e.target.name]:e.target.value});setMsg('');setError('')};const validEmail=e=>/^[^\s@]+@apollouniversity\.edu\.in$/i.test(e.trim());
 const run=async e=>{e.preventDefault();setLoading(true);setMsg('');setError('');try{if(mode==='signup'){if(!f.name.trim())throw Error('Enter your full name.');if(!validEmail(f.email))throw Error('Only @apollouniversity.edu.in accounts are allowed.');if(f.password.length<8)throw Error('Password must contain at least 8 characters.');if(f.role==='admin'&&!f.admin_code.trim())throw Error('Administrator code is required.');await api('/auth/register',{method:'POST',body:JSON.stringify({name:f.name.trim(),email:f.email.trim().toLowerCase(),password:f.password,role:f.role,admin_code:f.admin_code||null})});setMsg('Account created successfully. Please sign in.');setF({...f,password:'',admin_code:''});setMode('login')}else if(mode==='login'){if(!validEmail(f.email))throw Error('Only @apollouniversity.edu.in accounts are allowed.');const d=await api('/auth/login',{method:'POST',body:JSON.stringify({email:f.email.trim().toLowerCase(),password:f.password})});localStorage.setItem('aiqpg_token',d.access_token);localStorage.setItem('aiqpg_user',JSON.stringify(d.user));onLogin(d.user)}else if(mode==='forgot'){const d=await api('/auth/forgot-password',{method:'POST',body:JSON.stringify({email:f.email.trim().toLowerCase()})});setMsg(d.development_otp?`Development OTP: ${d.development_otp}`:d.message);setMode('otp')}else if(mode==='otp'){await api('/auth/verify-otp',{method:'POST',body:JSON.stringify({email:f.email.trim().toLowerCase(),otp:f.otp})});setMsg('OTP verified. Create your new password.');setMode('reset')}else{await api('/auth/reset-password',{method:'POST',body:JSON.stringify({email:f.email.trim().toLowerCase(),otp:f.otp,new_password:f.new_password})});setMsg('Password reset successful. Please sign in.');setMode('login')}}catch(e){setError(e.message)}finally{setLoading(false)}};
 const title={signup:'Create your account',login:'Welcome back',forgot:'Forgot password',otp:'Verify OTP',reset:'Reset password'}[mode];
 return <div className="auth-wrap"><div className="auth-left"><div className="auth-brand"><div className="brand-mark">AI</div><div><b>AIQPG</b><small>AI Question Paper Generator</small></div></div><h1>Generate smarter.<br/><span>Examine better.</span></h1><p>Faculty and administrator environments with secure college authentication.</p><div className="hero-list"><div>✓ College email authentication</div><div>✓ Faculty / Administrator role selection</div><div>✓ OTP password recovery</div></div></div><div className="auth-right"><div className="auth-card"><h2>{title}</h2><p>Official Apollo University email required.</p>{msg&&<div className="alert success">{msg}</div>}{error&&<div className="alert error">{error}</div>}<form onSubmit={run}>{mode==='signup'&&<Field label="Full Name"><input name="name" value={f.name} onChange={change} required/></Field>}{['signup','login','forgot','otp','reset'].includes(mode)&&<Field label="College Email"><input type="email" name="email" value={f.email} onChange={change} readOnly={mode==='otp'||mode==='reset'} required/></Field>}{mode==='signup'&&<><Field label="Role"><select name="role" value={f.role} onChange={change}><option value="faculty">Faculty</option><option value="admin">Administrator</option></select></Field>{f.role==='admin'&&<Field label="Administrator Code"><input name="admin_code" value={f.admin_code} onChange={change}/></Field>}<Field label="Password"><input type="password" name="password" value={f.password} onChange={change} minLength="8" required/></Field></>}{mode==='login'&&<Field label="Password"><input type="password" name="password" value={f.password} onChange={change} required/></Field>}{mode==='otp'&&<Field label="6-Digit OTP"><input name="otp" value={f.otp} onChange={change} maxLength="6" required/></Field>}{mode==='reset'&&<Field label="New Password"><input type="password" name="new_password" value={f.new_password} onChange={change} minLength="8" required/></Field>}<button className="primary wide" disabled={loading}>{loading?'Please wait…':mode==='signup'?'Create Account':mode==='login'?'Sign In':mode==='forgot'?'Send OTP':mode==='otp'?'Verify OTP':'Reset Password'}</button></form>{mode==='login'&&<div className="auth-links"><button onClick={()=>setMode('signup')}>Create account</button><button onClick={()=>setMode('forgot')}>Forgot password?</button></div>}{mode!=='login'&&<button className="link-btn" onClick={()=>setMode('login')}>Back to Sign In</button>}</div></div></div>
}

function Dashboard({user,go}){const[s,setS]=useState({questions:0,papers:0,subjects:0,syllabi:0,coverage:0});useEffect(()=>{api('/dashboard').then(d=>setS(x=>({...x,...d}))).catch(()=>{})},[]);return <div><div className="hero"><div><span className="eyebrow">AIQPG</span><h1>Welcome, {user.name}</h1><p>Build subjects, syllabi, question banks and AI-generated examination papers from one workflow.</p></div><button className="primary" onClick={()=>go('AI Paper Generator')}><Sparkles size={16}/> Generate Paper</button></div><div className="stat-grid"><Stat n={s.subjects} label="Subjects"/><Stat n={s.syllabi} label="Syllabi"/><Stat n={s.questions} label="Questions"/><Stat n={s.papers} label="Papers"/></div><div className="panel"><h2>Examination Workflow</h2><div className="workflow">{['Subject Management','Syllabus Analyzer','Question Bank','Blueprint Designer','AI Paper Generator','Answer Key Generator','Paper Vault'].map((x,i)=><div className="workflow-step" key={x}><b>{i+1}</b><span>{x}</span></div>)}</div></div></div>}
function Stat({n,label}){return <div className="stat"><strong>{n}</strong><span>{label}</span></div>}
function AdminDashboard({user,go}){
 const[stats,setStats]=useState({users:0,tables:0,logs:0,sessions:0});
 const[recentUsers,setRecentUsers]=useState([]);
 const[recentLogs,setRecentLogs]=useState([]);
 const[loading,setLoading]=useState(true);
 const[msg,setMsg]=useState('');

 const load=async()=>{
   setLoading(true);
   setMsg('');
   try{
     const[users,logs,sessions,tables]=await Promise.all([
       api('/admin/users'),
       api('/admin/logs'),
       api('/admin/sessions'),
       api('/admin/tables')
     ]);
     const userRows=Array.isArray(users)?users:(users?.items||[]);
     const logRows=Array.isArray(logs)?logs:(logs?.items||[]);
     const sessionRows=Array.isArray(sessions)?sessions:(sessions?.items||[]);
     const tableRows=Array.isArray(tables)?tables:(tables?.tables||[]);
     setStats({users:userRows.length,tables:tableRows.length,logs:logRows.length,sessions:sessionRows.length});
     setRecentUsers(userRows.slice(0,5));
     setRecentLogs(logRows.slice(0,5));
   }catch(e){
     setMsg(e.message||'Unable to load administrator dashboard data.');
   }finally{
     setLoading(false);
   }
 };

 useEffect(()=>{load()},[]);

 const actions=[
   ['User Management',Users,'Manage faculty and administrator accounts'],
   ['Database Console',Table2,'Browse SQLite tables and records'],
   ['Activity Logs',Activity,'Review system activities'],
   ['Login Sessions',Clock3,'Monitor login sessions']
 ];

 return <div>
   <div className="hero">
     <div>
       <span className="eyebrow">ADMINISTRATOR CONSOLE</span>
       <h1>Welcome, {user.name}</h1>
       <p>Manage users, inspect the SQLite database, review activity, and monitor login sessions.</p>
     </div>
     <button className="secondary" onClick={load}><RefreshCw size={16}/> Refresh</button>
   </div>

   {msg&&<div className="alert error">{msg}</div>}

   <div className="stat-grid">
     <div className="stat"><strong>{loading?'…':stats.users}</strong><span>Registered Users</span></div>
     <div className="stat"><strong>{loading?'…':stats.tables}</strong><span>SQLite Tables</span></div>
     <div className="stat"><strong>{loading?'…':stats.logs}</strong><span>Activity Logs</span></div>
     <div className="stat"><strong>{loading?'…':stats.sessions}</strong><span>Login Sessions</span></div>
   </div>

   <div className="panel" style={{marginTop:'18px'}}>
     <h2>Administrator Actions</h2>
     <div className="workflow">
       {actions.map(([name,Icon,text],i)=><button key={name} className="workflow-step" onClick={()=>go(name)} style={{border:'0',textAlign:'left',cursor:'pointer'}}>
         <b>{i+1}</b>
         <span style={{display:'flex',alignItems:'center',gap:'8px'}}><Icon size={18}/><strong>{name}</strong></span>
         <small style={{display:'block',marginTop:'4px',marginLeft:'26px',opacity:.7}}>{text}</small>
       </button>)}
     </div>
   </div>

   <div className="form-grid" style={{marginTop:'18px'}}>
     <div className="panel">
       <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px'}}>
         <h2 style={{margin:0}}>Recent Users</h2>
         <button className="secondary" onClick={()=>go('User Management')}>View All</button>
       </div>
       {recentUsers.length?<div className="table-wrap"><table><thead><tr><th>Name</th><th>Email</th><th>Role</th></tr></thead><tbody>{recentUsers.map((u,i)=><tr key={u.id??i}><td>{u.name??'—'}</td><td>{u.email??'—'}</td><td>{u.role??'—'}</td></tr>)}</tbody></table></div>:<Empty text={loading?'Loading users…':'No users found.'}/>} 
     </div>

     <div className="panel">
       <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px'}}>
         <h2 style={{margin:0}}>Recent Activity</h2>
         <button className="secondary" onClick={()=>go('Activity Logs')}>View Logs</button>
       </div>
       {recentLogs.length?<div className="table-wrap"><table><thead><tr><th>Action</th><th>User</th><th>Date</th></tr></thead><tbody>{recentLogs.map((x,i)=><tr key={x.id??i}><td>{x.action??'—'}</td><td>{x.user_id??'—'}</td><td>{x.created_at??'—'}</td></tr>)}</tbody></table></div>:<Empty text={loading?'Loading activity…':'No activity records found.'}/>} 
     </div>
   </div>
 </div>}

function SubjectManagement(){const[list,setList]=useState([]),[show,setShow]=useState(false),[edit,setEdit]=useState(null),[msg,setMsg]=useState(''),[q,setQ]=usePersistedState('aiqpg_subject_search',''),empty={name:'',code:'',department:'CSE',semester:'',academic_year:'2026-27',credits:4,description:''},[f,setF]=useState(empty);const load=()=>api('/subjects').then(setList).catch(e=>setMsg(e.message));useEffect(load,[]);const filtered=useMemo(()=>list.filter(s=>(s.name+' '+s.code+' '+s.department).toLowerCase().includes(q.toLowerCase())),[list,q]);const save=async()=>{try{await api(edit?`/subjects/${edit}`:'/subjects',{method:edit?'PUT':'POST',body:JSON.stringify({...f,credits:Number(f.credits)})});setMsg(edit?'Subject updated successfully.':'Subject created successfully.');setShow(false);setEdit(null);setF(empty);load()}catch(e){setMsg(e.message)}};const del=async id=>{if(!confirm('Delete this subject?'))return;try{await api(`/subjects/${id}`,{method:'DELETE'});load()}catch(e){setMsg(e.message)}};return <Module title="Subject Management" subtitle="Create and maintain subject name, code, department, semester and academic details." actions={<button className="primary" onClick={()=>{setF(empty);setEdit(null);setShow(true)}}><Plus size={16}/> Add Subject</button>}>{msg&&<div className="notice">{msg}</div>}<div className="filter-row"><input placeholder="Search subject or code" value={q} onChange={e=>setQ(e.target.value)}/></div>{show&&<div className="form-card"><h3>{edit?'Edit Subject':'Add Subject'}</h3><div className="form-grid">{[['name','Subject Name'],['code','Subject Code'],['department','Department'],['semester','Semester'],['academic_year','Academic Year'],['credits','Credits']].map(([k,l])=><Field key={k} label={l}><input type={k==='credits'?'number':'text'} value={f[k]} onChange={e=>setF({...f,[k]:e.target.value})}/></Field>)}<Field label="Description"><textarea value={f.description} onChange={e=>setF({...f,description:e.target.value})}/></Field></div><div className="actions"><button className="primary" onClick={save}><Save size={16}/> Save</button><button className="secondary" onClick={()=>setShow(false)}>Cancel</button></div></div>}<Table rows={filtered} cols={['id','code','name','department','semester','academic_year','credits']}/><div className="table-actions">{filtered.map(s=><div key={s.id}><button className="table-icon" onClick={()=>{setF({...empty,...s});setEdit(s.id);setShow(true)}}><Edit3 size={15}/></button><button className="table-icon" onClick={()=>del(s.id)}><Trash2 size={15}/></button></div>)}</div></Module>}

function SyllabusAnalyzer(){
 const[subjects,setSubjects]=useState([]),[list,setList]=useState([]),[mode,setMode]=usePersistedState('aiqpg_syllabus_mode','manual'),[sid,setSid]=usePersistedState('aiqpg_syllabus_sid',''),[title,setTitle]=usePersistedState('aiqpg_syllabus_title',''),[text,setText]=usePersistedState('aiqpg_syllabus_text',''),[file,setFile]=useState(null),[result,setResult]=usePersistedState('aiqpg_syllabus_result',null),[msg,setMsg]=useState(''),[busy,setBusy]=useState(false);
 const load=async()=>{
   setMsg('');
   try{
     const[a,b]=await Promise.all([api('/subjects'),api('/syllabi')]);
     setSubjects(Array.isArray(a)?a:[]);
     setList(Array.isArray(b)?b:[]);
   }catch(e){setMsg(e.message||'Unable to load syllabus data.')}
 };
 useEffect(()=>{load()},[]);
 const run=async()=>{setBusy(true);setMsg('');try{let d;if(mode==='manual'){if(!sid||!text.trim())throw Error('Select subject and enter syllabus text.');d=await api('/syllabi/analyze',{method:'POST',body:JSON.stringify({subject_id:Number(sid),title:title||'Syllabus',text,file_name:''})})}else{if(!sid||!file)throw Error('Select subject and syllabus file.');const fd=new FormData();fd.append('file',file);fd.append('title',title||file.name);d=await api(`/syllabi/upload?subject_id=${sid}`,{method:'POST',body:fd})}if(d?.analysis)setResult(d.analysis);setMsg(d?.message||'Syllabus analyzed and saved successfully.');await load()}catch(e){setMsg(e.message)}finally{setBusy(false)}};
 const units=Array.isArray(result?.units)?result.units:[];
 return <Module title="Syllabus Analyzer" subtitle="Enter manually or upload a syllabus without leaving this page.">
   <div className="tabs"><button className={mode==='manual'?'active':''} onClick={()=>setMode('manual')}>Manual Entry</button><button className={mode==='upload'?'active':''} onClick={()=>setMode('upload')}>Upload Syllabus</button></div>
   <div className="form-grid"><Field label="Subject"><select value={sid} onChange={e=>setSid(e.target.value)}><option value="">Select Subject</option>{subjects.map(s=><option key={s.id} value={s.id}>{s.code} - {s.name}</option>)}</select></Field><Field label="Syllabus Title"><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="2026-27 Syllabus"/></Field>{mode==='upload'?<Field label="Syllabus File"><input type="file" accept=".pdf,.docx,.txt,.pptx" onChange={e=>setFile(e.target.files?.[0]||null)}/></Field>:null}</div>
   {mode==='manual'&&<Field label="Syllabus Content"><textarea className="large-textarea" value={text} onChange={e=>setText(e.target.value)} placeholder="Paste syllabus content here..."/></Field>}
   <button className="primary" disabled={busy} onClick={run}>{busy?'Analyzing…':mode==='manual'?'Analyze & Save':'Upload, Analyze & Save'}</button>
   {msg&&<div className="notice">{msg}</div>}
   {units.length>0&&<div className="result-card"><h3>Analyzed Syllabus</h3><div className="unit-grid">{units.map((u,i)=>{const topics=Array.isArray(u?.topics)?u.topics:[];return <div className="unit-card" key={u?.name||`unit-${i}`}><b>{u?.name||`Unit ${i+1}`}</b><ul>{topics.map((t,j)=><li key={`${u?.name||i}-${j}`}>{t}</li>)}</ul></div>})}</div><p><b>Units:</b> {result.total_units??units.length} &nbsp; <b>Topics:</b> {result.total_topics??units.reduce((n,u)=>n+(Array.isArray(u?.topics)?u.topics.length:0),0)}</p></div>}
   <h3>Saved Syllabi</h3><Table rows={list.map(x=>({...x,units:x.total_units,topics:x.total_topics}))} cols={['id','subject_id','title','file_name','units','topics','status']}/>
 </Module>}

function QuestionBank(){const[questions,setQuestions]=useState([]),[name,setName]=usePersistedState('aiqpg_qb_name',''),[code,setCode]=usePersistedState('aiqpg_qb_code',''),[file,setFile]=useState(null),[msg,setMsg]=useState(''),[busy,setBusy]=useState(false);const load=async n=>{if(!n.trim()){setQuestions([]);return}try{setQuestions(await api(`/questions?subject_name=${encodeURIComponent(n.trim())}`))}catch(e){setMsg(e.message)}};useEffect(()=>{if(name)load(name)},[]);const process=async()=>{if(!name.trim()||!file){setMsg('Enter subject name and choose a question-bank file.');return}setBusy(true);setMsg('');try{const fd=new FormData();fd.append('file',file);const d=await api(`/questions/upload?subject_name=${encodeURIComponent(name.trim())}&subject_code=${encodeURIComponent(code.trim())}`,{method:'POST',body:fd});setMsg(`${d.message}. Section A (2 marks): ${d.section_a_questions}. Section B (8 marks): ${d.section_b_questions}. Ignored non-question lines: ${d.ignored}.`);await load(d.subject_name||name)}catch(e){setMsg(e.message)}finally{setBusy(false)}};const clearOld=async()=>{if(!name.trim()){setMsg('Enter subject name first.');return}if(!confirm(`Delete all existing questions for ${name}? Upload the correct question bank again after this.`))return;try{const subs=await api(`/subjects`);const s=subs.find(x=>x.name?.trim().toLowerCase()===name.trim().toLowerCase());if(!s){setMsg('Subject not found.');return}const d=await api(`/questions/subject/${s.id}/clear`,{method:'DELETE'});setMsg(d.message);setQuestions([])}catch(e){setMsg(e.message)}};return <Module title="Question Bank" subtitle="Upload only exam questions. Section A is stored as 2 marks and Section B as 8 marks. Headings, university name, course name, unit labels, instructions and L/CO mapping text are not stored."><div className="form-grid"><Field label="Question Bank File"><input type="file" accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.pptx" onChange={e=>setFile(e.target.files?.[0]||null)}/></Field><Field label="Subject Name"><input value={name} onChange={e=>setName(e.target.value)} placeholder="Internet of Things"/></Field><Field label="Subject Code"><input value={code} onChange={e=>setCode(e.target.value)} placeholder="CS401"/></Field></div><div className="actions"><button className="primary" disabled={busy} onClick={process}><Upload size={16}/>{busy?'Processing…':'Process Questions'}</button><button className="secondary" onClick={clearOld}><Trash2 size={16}/> Clear Existing Questions</button></div>{msg&&<div className="notice">{msg}</div>}{name&&<h3>Processed Questions for {name} {code&&`(${code})`}</h3>}<Table rows={questions} cols={['id','question_text','marks','unit','topic','difficulty','bloom_level','course_outcome','duplicate_status','mapping_status','status']}/></Module>}

function BlueprintDesigner(){
 const[subjects,setSubjects]=useState([]),[syllabi,setSyllabi]=useState([]),[rows,setRows]=useState([]),[edit,setEdit]=useState(null),[msg,setMsg]=useState('');
 const[ f,setF ]=usePersistedState('aiqpg_blueprint_form',{
   subject_id:'',syllabus_id:'',blueprint_name:'Internal Assessment Blueprint',exam_type:'Internal Assessment',duration:'90 Minutes',total_marks:50,total_questions:25,
   difficulty_distribution:{Easy:20,Medium:50,Hard:30},bloom_distribution:{Remember:20,Understand:30,Apply:30,Analyze:20},unit_weightage:{}
 });
 const load=async()=>{setMsg('');try{const[a,b,c]=await Promise.all([api('/subjects'),api('/syllabi'),api('/blueprints')]);setSubjects(Array.isArray(a)?a:[]);setSyllabi(Array.isArray(b)?b:[]);setRows(Array.isArray(c)?c:[])}catch(e){setMsg(e.message||'Unable to load blueprint data.')}};
 useEffect(()=>{load()},[]);
 const selectedSyllabus=useMemo(()=>syllabi.find(x=>String(x.id)===String(f.syllabus_id)),[syllabi,f.syllabus_id]);
 const unitNames=useMemo(()=>Array.isArray(selectedSyllabus?.units)?selectedSyllabus.units.map((u,i)=>String(u?.name||u||`Unit ${i+1}`)).filter(Boolean):[],[selectedSyllabus]);
 useEffect(()=>{
   if(!unitNames.length)return;
   const existing=(f.unit_weightage&&typeof f.unit_weightage==='object')?f.unit_weightage:{};
   const next={};
   const missing=unitNames.filter(u=>existing[u]==null);
   const equal=missing.length?Math.round((100/unitNames.length)*100)/100:0;
   unitNames.forEach(u=>{next[u]=existing[u]!=null?Number(existing[u]):equal});
   const sum=Object.values(next).reduce((a,b)=>a+Number(b||0),0);
   if(missing.length){next[unitNames[unitNames.length-1]]=Number(next[unitNames[unitNames.length-1]])+Number((100-sum).toFixed(2));}
   setF(prev=>({...prev,unit_weightage:next}));
 },[unitNames.join('|')]);
 const difficulty=f.difficulty_distribution||{Easy:20,Medium:50,Hard:30};
 const bloom=f.bloom_distribution||{Remember:20,Understand:30,Apply:30,Analyze:20};
 const units=f.unit_weightage||{};
 const pctTotal=o=>Object.values(o).reduce((a,b)=>a+Number(b||0),0);
 const updatePct=(group,key,value)=>setF(prev=>({...prev,[group]:{...(prev[group]||{}),[key]:Number(value)}}));
 const resetNew=()=>setF(prev=>({...prev,subject_id:'',syllabus_id:'',blueprint_name:'Internal Assessment Blueprint',exam_type:'Internal Assessment',duration:'90 Minutes',total_marks:50,total_questions:25,difficulty_distribution:{Easy:20,Medium:50,Hard:30},bloom_distribution:{Remember:20,Understand:30,Apply:30,Analyze:20},unit_weightage:{}}));
 const save=async()=>{try{
   if(!f.subject_id)throw Error('Select a subject.');
   if(Number(f.total_marks)<=0||Number(f.total_questions)<=0)throw Error('Total marks and total questions must be greater than 0.');
   const diffTotal=pctTotal(difficulty); if(Math.abs(diffTotal-100)>0.01)throw Error(`Difficulty / Taxonomy Level must total 100%. Current total: ${diffTotal}%.`);
   const bloomTotal=pctTotal(bloom); if(Math.abs(bloomTotal-100)>0.01)throw Error(`Bloom's Taxonomy must total 100%. Current total: ${bloomTotal}%.`);
   if(unitNames.length){const unitTotal=pctTotal(units);if(Math.abs(unitTotal-100)>0.01)throw Error(`Unit weightage must total 100%. Current total: ${unitTotal}%.`);}
   const body={...f,subject_id:Number(f.subject_id),syllabus_id:f.syllabus_id?Number(f.syllabus_id):null,total_marks:Number(f.total_marks),total_questions:Number(f.total_questions),question_pattern:{},unit_weightage:units,difficulty_distribution:difficulty,bloom_distribution:bloom,co_distribution:{}};
   await api(edit?`/blueprints/${edit}`:'/blueprints',{method:edit?'PUT':'POST',body:JSON.stringify(body)});setMsg('Blueprint saved successfully.');setEdit(null);await load();
 }catch(e){setMsg(e.message)}};
 const editBlueprint=async b=>{try{const full=await api(`/blueprints/${b.id}`);setEdit(b.id);setF(prev=>({...prev,subject_id:String(full.subject_id??b.subject_id??''),syllabus_id:full.syllabus_id?String(full.syllabus_id):'',blueprint_name:full.blueprint_name??b.blueprint_name??'',exam_type:full.exam_type??b.exam_type??'Internal Assessment',duration:full.duration??b.duration??'90 Minutes',total_marks:full.total_marks??b.total_marks??50,total_questions:full.total_questions??b.total_questions??25,unit_weightage:full.unit_weightage||{},difficulty_distribution:full.difficulty_distribution||{Easy:20,Medium:50,Hard:30},bloom_distribution:full.bloom_distribution||{Remember:20,Understand:30,Apply:30,Analyze:20}}));setMsg('Blueprint loaded for editing.')}catch(e){setMsg(e.message)}};
 return <Module title="Blueprint Designer" subtitle="Create a blueprint with unit weightage, difficulty/taxonomy percentage and Bloom's Taxonomy distribution.">
   <div className="form-grid">
    <Field label="Subject"><select value={f.subject_id} onChange={e=>setF({...f,subject_id:e.target.value,syllabus_id:'',unit_weightage:{}})}><option value="">Select Subject</option>{subjects.map(s=><option key={s.id} value={s.id}>{s.code} - {s.name}</option>)}</select></Field>
    <Field label="Syllabus"><select value={f.syllabus_id} onChange={e=>setF({...f,syllabus_id:e.target.value,unit_weightage:{}})}><option value="">Select Syllabus</option>{syllabi.filter(s=>!f.subject_id||s.subject_id===Number(f.subject_id)).map(s=><option key={s.id} value={s.id}>{s.title}</option>)}</select></Field>
    <Field label="Blueprint Name"><input value={f.blueprint_name} onChange={e=>setF({...f,blueprint_name:e.target.value})}/></Field>
    <Field label="Exam Type"><input value={f.exam_type} onChange={e=>setF({...f,exam_type:e.target.value})}/></Field>
    <Field label="Duration"><input value={f.duration} onChange={e=>setF({...f,duration:e.target.value})}/></Field>
    <Field label="Total Marks"><input type="number" min="1" value={f.total_marks} onChange={e=>setF({...f,total_marks:e.target.value})}/></Field>
    <Field label="Total Questions"><input type="number" min="1" value={f.total_questions} onChange={e=>setF({...f,total_questions:e.target.value})}/></Field>
   </div>

   <div className="form-card"><h3>Difficulty / Taxonomy Level</h3><p style={{marginTop:0}}>Enter the percentage of questions for each level. The total must be 100%.</p><div className="form-grid">{['Easy','Medium','Hard'].map(k=><Field key={k} label={`${k} %`}><input type="number" min="0" max="100" step="0.01" value={difficulty[k]??0} onChange={e=>updatePct('difficulty_distribution',k,e.target.value)}/></Field>)}</div><div className={Math.abs(pctTotal(difficulty)-100)<0.01?'notice':'alert error'}>Total: {pctTotal(difficulty)}%</div></div>

   <div className="form-card"><h3>Unit Weightage</h3>{unitNames.length?<><p style={{marginTop:0}}>Set the percentage for every syllabus unit. The total must be 100%.</p><div className="form-grid">{unitNames.map((u,i)=><Field key={u} label={`${u} %`}><input type="number" min="0" max="100" step="0.01" value={units[u]??0} onChange={e=>updatePct('unit_weightage',u,e.target.value)}/></Field>)}</div><div className={Math.abs(pctTotal(units)-100)<0.01?'notice':'alert error'}>Total: {pctTotal(units)}%</div></>:<div className="notice">Select a syllabus to load its units here.</div>}</div>

   <div className="form-card"><h3>Bloom's Taxonomy</h3><p style={{marginTop:0}}>Set the percentage for the Bloom levels used by this blueprint. The total must be 100%.</p><div className="form-grid">{['Remember','Understand','Apply','Analyze'].map(k=><Field key={k} label={`${k} %`}><input type="number" min="0" max="100" step="0.01" value={bloom[k]??0} onChange={e=>updatePct('bloom_distribution',k,e.target.value)}/></Field>)}</div><div className={Math.abs(pctTotal(bloom)-100)<0.01?'notice':'alert error'}>Total: {pctTotal(bloom)}%</div></div>

   <div className="actions"><button className="primary" disabled={!f.subject_id||Math.abs(pctTotal(difficulty)-100)>0.01||Math.abs(pctTotal(bloom)-100)>0.01|| (unitNames.length>0&&Math.abs(pctTotal(units)-100)>0.01)} onClick={save}><Save size={16}/>{edit?'Update Blueprint':'Save Blueprint'}</button><button className="secondary" onClick={()=>{setEdit(null);resetNew();setMsg('New blueprint form ready.')}}>New Blueprint</button></div>
   {msg&&<div className="notice">{msg}</div>}
   <h3>Saved Blueprints</h3><Table rows={rows} cols={['id','blueprint_name','exam_type','duration','total_marks','total_questions','status']}/><div className="row-actions">{rows.map(b=><button key={b.id} className="secondary" onClick={()=>editBlueprint(b)}>Edit #{b.id}</button>)}</div>
 </Module>}

function PaperGenerator(){
 const[subjects,setSubjects]=useState([]),[blueprints,setBlueprints]=useState([]),[f,setF]=usePersistedState('aiqpg_paper_form',{subject_id:'',syllabus_id:'',blueprint_id:'',title:'AI Generated Question Paper',exam_type:'Internal Assessment',duration:'90 Minutes',choice_mode:'No Choice',generation_mode:'hybrid',topics:'',instructions:'',section_a_questions:5,section_a_marks:2,section_b_questions:5,section_b_marks:8}),[paper,setPaper]=usePersistedState('aiqpg_current_paper',null),[msg,setMsg]=useState(''),[editing,setEditing]=useState(false),[editContent,setEditContent]=usePersistedState('aiqpg_current_paper_edit',[]),[savingEdit,setSavingEdit]=useState(false);
 useEffect(()=>{api('/subjects').then(setSubjects).catch(()=>{});api('/blueprints').then(setBlueprints).catch(()=>{})},[]);
 const aCount=Number(f.section_a_questions)||0,aMarks=Number(f.section_a_marks)||0,bCount=Number(f.section_b_questions)||0,bMarks=Number(f.section_b_marks)||0;
 const totalQuestions=aCount+bCount,totalMarks=aCount*aMarks+bCount*bMarks;
 const internalChoice=f.choice_mode==='Internal Choice'||f.choice_mode==='Either/Or';
 const gen=async()=>{try{
   if(!f.subject_id)throw Error('Select a subject.');
   if(aCount<0||bCount<0||aMarks<=0||bMarks<=0)throw Error('Enter valid section counts and marks.');
   if(internalChoice&&bCount===0)throw Error('Enter at least one Section B question slot for internal choice.');
   const d=await api('/papers/generate',{method:'POST',body:JSON.stringify({...f,subject_id:Number(f.subject_id),blueprint_id:f.blueprint_id?Number(f.blueprint_id):null,total_marks:totalMarks,total_questions:totalQuestions,section_a_questions:aCount,section_a_marks:aMarks,section_b_questions:bCount,section_b_marks:bMarks,choice_mode:f.choice_mode,generation_mode:f.generation_mode,topics:f.topics.split(',').map(x=>x.trim()).filter(Boolean)})});
   setPaper(d);setEditContent(JSON.parse(JSON.stringify(d.content||[])));setEditing(false);setMsg(d.message)
 }catch(e){setMsg(e.message)}};
 const startEdit=()=>{setEditContent(JSON.parse(JSON.stringify(paper?.content||[])));setEditing(true);setMsg('')};
 const cancelEdit=()=>{setEditContent(JSON.parse(JSON.stringify(paper?.content||[])));setEditing(false);setMsg('Edit cancelled.')};
 const updateSimple=(index,value)=>setEditContent(items=>items.map((item,i)=>i===index?{...item,question:value}:item));
 const updateChoice=(index,choiceIndex,value)=>setEditContent(items=>items.map((item,i)=>{
   if(i!==index)return item;
   const choices=[...(item.choices||[])];
   choices[choiceIndex]={...choices[choiceIndex],question:value};
   return {...item,choices};
 }));
 const saveEdit=async()=>{if(!paper)return;setSavingEdit(true);setMsg('');try{const d=await api(`/papers/${paper.id}/content`,{method:'PUT',body:JSON.stringify({content:editContent})});setPaper(prev=>({...prev,content:d.content}));setEditContent(JSON.parse(JSON.stringify(d.content||[])));setEditing(false);setMsg(d.message)}catch(e){setMsg(e.message)}finally{setSavingEdit(false)}};
 const escapeHtml=(value)=>String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
 const paperHTML=()=>{
   const content=paper?.content||[];
   let html=`<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(paper?.title||'Question Paper')}</title><style>body{font-family:Arial,sans-serif;max-width:850px;margin:35px auto;padding:0 25px;line-height:1.55;color:#111}h1{text-align:center;margin-bottom:5px}h2{margin-top:28px;border-bottom:1px solid #bbb;padding-bottom:6px}.meta{text-align:center;color:#444;margin-bottom:25px}.q{margin:16px 0}.marks{float:right;font-weight:700}.or{text-align:center;font-weight:700;margin:8px 0}.choice{margin:8px 0 8px 18px}.muted{color:#666;font-size:12px;margin-top:3px}@media print{body{margin:15mm auto;max-width:none;padding:0}.no-print{display:none}}</style></head><body>`;
   html+=`<h1>${escapeHtml(paper?.title||'Question Paper')}</h1><div class="meta">${escapeHtml(f.exam_type||'Exam')} &nbsp; | &nbsp; Duration: ${escapeHtml(f.duration||'')} &nbsp; | &nbsp; Total Marks: ${totalMarks}</div>`;
   const a=content.filter(q=>q.section==='Section A'),b=content.filter(q=>q.section==='Section B');
   html+=`<h2>Section A — ${aMarks} Marks Each</h2>`;
   a.forEach(q=>{html+=`<div class="q"><b>${q.number}.</b> ${escapeHtml(q.question)} <span class="marks">${q.marks} marks</span></div>`});
   html+=`<h2>Section B — ${bMarks} Marks Each</h2>`;
   b.forEach(q=>{html+=`<div class="q"><b>${q.number}.</b>`;if(q.choices?.length===2){html+=`<div class="choice"><b>(a)</b> ${escapeHtml(q.choices[0].question)} <span class="marks">${q.choices[0].marks} marks</span></div><div class="or">OR</div><div class="choice"><b>(b)</b> ${escapeHtml(q.choices[1].question)} <span class="marks">${q.choices[1].marks} marks</span></div>`}else{html+=` ${escapeHtml(q.question)} <span class="marks">${q.marks} marks</span>`}html+=`</div>`});
   html+=`</body></html>`;return html;
 };
 const downloadPaper=async()=>{
  if(!paper)return;
  try{
    setMsg('Preparing PDF…');
    const token=localStorage.getItem('aiqpg_token');
    const r=await fetch(`${API}/papers/${paper.id}/download`,{headers:token?{Authorization:`Bearer ${token}`}:{}});
    if(!r.ok){
      let detail='Unable to download the PDF.';
      try{const d=await r.json();detail=typeof d.detail==='string'?d.detail:detail}catch{}
      throw new Error(detail);
    }
    const blob=await r.blob();
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;
    a.download=`${String(paper.title||'question-paper').replace(/[^a-z0-9]+/gi,'-').replace(/^-+|-+$/g,'')||'question-paper'}-${paper.id}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
    setMsg('PDF downloaded successfully. It is saved in your browser’s default Downloads location.');
  }catch(e){setMsg(e.message)}
 };
 const printPaper=()=>{if(!paper)return;const w=window.open('','_blank','width=900,height=700');if(!w){setMsg('Please allow pop-ups to print the paper.');return}w.document.open();w.document.write(paperHTML());w.document.close();w.focus();setTimeout(()=>w.print(),300)};
 return <Module title="AI Paper Generator" subtitle="Create the exact paper structure and optionally use internal a OR b choice in Section B. Each choice still carries the same marks.">
  <div className="form-grid">
   <Field label="Subject"><select value={f.subject_id} onChange={e=>setF({...f,subject_id:e.target.value})}><option value="">Select Subject</option>{subjects.map(s=><option key={s.id} value={s.id}>{s.code} - {s.name}</option>)}</select></Field>
   <Field label="Blueprint"><select value={f.blueprint_id} onChange={e=>setF({...f,blueprint_id:e.target.value})}><option value="">No Blueprint / Manual Sections</option>{blueprints.filter(b=>!f.subject_id||b.subject_id===Number(f.subject_id)).map(b=><option key={b.id} value={b.id}>{b.blueprint_name}</option>)}</select></Field>
   <Field label="Paper Title"><input value={f.title} onChange={e=>setF({...f,title:e.target.value})}/></Field>
   <Field label="Exam Type"><input value={f.exam_type} onChange={e=>setF({...f,exam_type:e.target.value})}/></Field>
   <Field label="Duration"><input value={f.duration} onChange={e=>setF({...f,duration:e.target.value})}/></Field>
   <Field label="Generation Source"><select value={f.generation_mode} onChange={e=>setF({...f,generation_mode:e.target.value})}><option value="hybrid">Question Bank + AI for Missing Questions</option><option value="question_bank">Question Bank Only</option><option value="ai">AI Generated</option></select></Field>
  </div>
  <div className="panel" style={{marginTop:'18px'}}><h3>Question Paper Sections</h3>
   <div className="form-grid">
    <Field label="Section A - Number of Questions"><input type="number" min="0" value={f.section_a_questions} onChange={e=>setF({...f,section_a_questions:e.target.value})}/></Field>
    <Field label="Section A - Marks / Question"><input type="number" min="1" value={f.section_a_marks} onChange={e=>setF({...f,section_a_marks:e.target.value})}/></Field>
    <Field label="Section B - Number of Question Slots"><input type="number" min="0" value={f.section_b_questions} onChange={e=>setF({...f,section_b_questions:e.target.value})}/></Field>
    <Field label="Section B - Marks / Question"><input type="number" min="1" value={f.section_b_marks} onChange={e=>setF({...f,section_b_marks:e.target.value})}/></Field>
   </div>
   <div className="notice">Section A: {aCount} × {aMarks} = {aCount*aMarks} marks &nbsp; | &nbsp; Section B: {bCount} × {bMarks} = {bCount*bMarks} marks &nbsp; | &nbsp; Total: {totalQuestions} question slots / {totalMarks} marks</div>
  </div>
  <div className="form-grid" style={{marginTop:'18px'}}>
   <Field label="Section B Choice"><select value={f.choice_mode} onChange={e=>setF({...f,choice_mode:e.target.value})}><option>No Choice</option><option>Internal Choice</option><option>Either/Or</option></select></Field>
   <Field label="Topics (optional)"><input value={f.topics} onChange={e=>setF({...f,topics:e.target.value})} placeholder="MQTT, sensors, IoT architecture"/></Field>
   <Field label="Instructions"><textarea value={f.instructions} onChange={e=>setF({...f,instructions:e.target.value})}/></Field>
  </div>
  {internalChoice&&<div className="notice">Internal Choice is enabled for Section B. Example: 11(a) OR 11(b), and both alternatives carry {bMarks} marks. The pair counts as ONE question slot.</div>}
  <button className="primary" disabled={!f.subject_id||totalQuestions===0} onClick={gen}><Sparkles size={16}/> Generate Exact Question Paper</button>
  {msg&&<div className="notice">{msg}</div>}
  {paper&&<div className="paper-preview">
   <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:'12px',flexWrap:'wrap'}}>
    <div><h2 style={{marginBottom:'4px'}}>{paper.title}</h2><p><b>Generation:</b> {paper.generation_mode_label||'Question Bank + AI for Missing Questions'} &nbsp; | &nbsp; <b>Choice:</b> {paper.choice_mode||'No Choice'}</p></div>
    <div className="actions">
      {!editing&&<><button className="secondary" onClick={startEdit}><Edit3 size={16}/> Edit</button><button className="secondary" onClick={downloadPaper}><Download size={16}/> Download</button><button className="secondary" onClick={printPaper}><Printer size={16}/> Print</button></>}
      {editing&&<><button className="primary" disabled={savingEdit} onClick={saveEdit}><Save size={16}/>{savingEdit?'Saving…':'Save Changes'}</button><button className="secondary" disabled={savingEdit} onClick={cancelEdit}>Cancel</button></>}
    </div>
   </div>
   <h3>Section A — {aMarks} Marks Each</h3>
   {(editing?editContent:paper.content||[]).filter(q=>q.section==='Section A').map((q,idx)=>{
     const originalIndex=(editing?editContent:paper.content||[]).indexOf(q);
     return <div className="paper-q" key={q.number}><b>{q.number}. </b>{editing?<textarea value={q.question||''} onChange={e=>updateSimple(originalIndex,e.target.value)} style={{width:'100%',minHeight:'70px',marginTop:'8px'}}/>:<>{q.question}</>}<span>{q.marks} marks</span>{!editing&&<small>{q.unit} · {q.topic} · {q.difficulty} · {q.bloom_level} · {q.co}</small>}</div>
   })}
   <h3>Section B — {bMarks} Marks Each</h3>
   {(editing?editContent:paper.content||[]).filter(q=>q.section==='Section B').map((q)=>{
     const originalIndex=(editing?editContent:paper.content||[]).indexOf(q);
     return <div className="paper-q" key={q.number}>
       <b>{q.number}. </b>
       {q.choices?.length===2 ? <>
         <div style={{marginTop:'6px'}}><b>(a)</b>{editing?<textarea value={q.choices[0].question||''} onChange={e=>updateChoice(originalIndex,0,e.target.value)} style={{width:'100%',minHeight:'70px',marginTop:'6px'}}/>:<>{' '+q.choices[0].question}</>}<span>{q.choices[0].marks} marks</span>{!editing&&<small>{q.choices[0].unit} · {q.choices[0].topic} · {q.choices[0].difficulty} · {q.choices[0].bloom_level} · {q.choices[0].co}</small>}</div>
         <div style={{textAlign:'center',fontWeight:700,margin:'8px 0'}}>OR</div>
         <div><b>(b)</b>{editing?<textarea value={q.choices[1].question||''} onChange={e=>updateChoice(originalIndex,1,e.target.value)} style={{width:'100%',minHeight:'70px',marginTop:'6px'}}/>:<>{' '+q.choices[1].question}</>}<span>{q.choices[1].marks} marks</span>{!editing&&<small>{q.choices[1].unit} · {q.choices[1].topic} · {q.choices[1].difficulty} · {q.choices[1].bloom_level} · {q.choices[1].co}</small>}</div>
       </> : <>{editing?<textarea value={q.question||''} onChange={e=>updateSimple(originalIndex,e.target.value)} style={{width:'100%',minHeight:'70px',marginTop:'8px'}}/>:<>{q.question}</>}<span>{q.marks} marks</span>{!editing&&<small>{q.unit} · {q.topic} · {q.difficulty} · {q.bloom_level} · {q.co}</small>}</>}
     </div>
   })}
  </div>}
 </Module>
}
function PreviousAnalyzer(){const[subjects,setSubjects]=useState([]),[sid,setSid]=usePersistedState('aiqpg_previous_sid',''),[title,setTitle]=usePersistedState('aiqpg_previous_title','Previous Question Paper'),[file,setFile]=useState(null),[analysis,setAnalysis]=usePersistedState('aiqpg_previous_analysis',null),[msg,setMsg]=useState('');useEffect(()=>{api('/subjects').then(setSubjects)},[]);const run=async()=>{try{const fd=new FormData();if(file)fd.append('file',file);const d=await api(`/previous-papers/analyze?subject_id=${sid}&title=${encodeURIComponent(title)}`,{method:'POST',body:fd});setAnalysis(d.analysis);setMsg('Previous paper analysis saved.')}catch(e){setMsg(e.message)}};return <Module title="Previous Paper Analyzer" subtitle="Upload a previous question paper and analyze frequently asked questions, topics, units and difficulty trends on this page."><div className="form-grid"><Field label="Subject"><select value={sid} onChange={e=>setSid(e.target.value)}><option value="">Select Subject</option>{subjects.map(s=><option key={s.id} value={s.id}>{s.code} - {s.name}</option>)}</select></Field><Field label="Paper Title"><input value={title} onChange={e=>setTitle(e.target.value)}/></Field><Field label="Previous Paper"><input type="file" accept=".pdf,.docx,.txt,.csv,.xlsx,.pptx" onChange={e=>setFile(e.target.files?.[0]||null)}/></Field></div><button className="primary" disabled={!sid} onClick={run}><History size={16}/> Analyze Previous Paper</button>{msg&&<div className="notice">{msg}</div>}{analysis&&<div className="result-card"><h3>AI Trend Analysis</h3><p><b>Frequently asked:</b> {(analysis.frequently_asked||[]).join(', ')||'None'}</p><p><b>Repeated topics:</b> {(analysis.repeated_topics||[]).join(', ')||'None'}</p><p><b>Important units:</b> {(analysis.important_units||[]).join(', ')||'None'}</p><p><b>Difficulty trends:</b> {JSON.stringify(analysis.difficulty_trends||{})}</p><p>{(analysis.observations||[]).join(' ')}</p></div>}</Module>}

function AnswerKeys(){const[subjects,setSubjects]=useState([]),[sid,setSid]=usePersistedState('aiqpg_answer_sid',''),[qs,setQs]=useState([]),[selected,setSelected]=usePersistedState('aiqpg_answer_selected',''),[marks,setMarks]=usePersistedState('aiqpg_answer_marks',5),[result,setResult]=usePersistedState('aiqpg_answer_result',null),[msg,setMsg]=useState('');useEffect(()=>{api('/subjects').then(setSubjects)},[]);useEffect(()=>{if(sid)api(`/questions?subject_id=${sid}`).then(setQs).catch(()=>setQs([]));else setQs([])},[sid]);const gen=async()=>{const q=qs.find(x=>x.id===Number(selected));if(!q)return;try{const d=await api('/answer-keys/generate',{method:'POST',body:JSON.stringify({question_id:q.id,question_text:q.question_text,marks:Number(marks)})});setResult(d);setMsg('Correct AI answer generated and saved.')}catch(e){setMsg(e.message)}};return <Module title="Answer Key Generator" subtitle="Generate a complete, mark-scaled answer for the selected question using Gemini AI."><div className="form-grid"><Field label="Subject"><select value={sid} onChange={e=>setSid(e.target.value)}><option value="">Select Subject</option>{subjects.map(s=><option key={s.id} value={s.id}>{s.code} - {s.name}</option>)}</select></Field><Field label="Question"><select value={selected} onChange={e=>setSelected(e.target.value)}><option value="">Select Question</option>{qs.map(q=><option key={q.id} value={q.id}>{q.question_text.slice(0,100)}</option>)}</select></Field><Field label="Marks"><input type="number" min="1" value={marks} onChange={e=>setMarks(e.target.value)}/></Field></div><button className="primary" disabled={!selected} onClick={gen}><KeyRound size={16}/> Generate Answer</button>{msg&&<div className="notice">{msg}</div>}{result&&<div className="answer-card"><h3>AI Generated Answer</h3><p>{result.answer}</p><h4>Key Points</h4><ul>{(result.key_points||[]).map((p,i)=><li key={i}>{p}</li>)}</ul></div>}</Module>}


function Vault(){
 const[rows,setRows]=useState([]),[msg,setMsg]=useState(''),[busyId,setBusyId]=useState(null);

 const load=()=>api('/papers').then(setRows).catch(e=>setMsg(e.message));

 useEffect(load,[]);

 const fin=async id=>{
   setBusyId(id);
   setMsg('');
   try{
     const d=await api(`/papers/${id}/finalize`,{method:'POST'});
     setMsg(d.message||'Paper finalized and added to Paper Vault.');
     load();
   }catch(e){
     setMsg(e.message);
   }finally{
     setBusyId(null);
   }
 };

 const del=async id=>{
   const paper=rows.find(x=>x.id===id);
   const title=paper?.title||`Paper #${id}`;
   if(!confirm(`Delete "${title}"? This cannot be undone.`))return;

   setBusyId(id);
   setMsg('');
   try{
     const d=await api(`/papers/${id}`,{method:'DELETE'});
     setMsg(d.message||'Paper deleted.');
     load();
   }catch(e){
     setMsg(e.message);
   }finally{
     setBusyId(null);
   }
 };

 return <Module title="Paper Vault" subtitle="Store, finalize and manage generated examination papers.">
   {msg&&<div className="notice">{msg}</div>}
   {rows.map(p=><div className="vault-item" key={p.id}>
     <div>
       <b>#{p.id} {p.title}</b>
       <span>{p.total_questions} questions · {p.total_marks} marks · {p.status}</span>
     </div>
     <div className="actions">
       {p.status!=='final'&&
         <button className="secondary" disabled={busyId===p.id} onClick={()=>fin(p.id)}>
           {busyId===p.id?'Please wait…':'Finalize'}
         </button>
       }
       <button className="secondary" disabled={busyId===p.id} onClick={()=>del(p.id)}>
         {busyId===p.id?'Please wait…':'Delete'}
       </button>
     </div>
   </div>)}
   {!rows.length&&<Empty text="No papers saved yet."/>}
 </Module>
}


function Assistant() {
  const [input, setInput] = useState('');
  const [history, setHistory] = usePersistedState(
    'aiqpg_assistant_history',
    []
  );
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const recognitionRef = useRef(null);

  const startVoice = () => {
    setVoiceError('');

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceError(
        'Voice input is not supported in this browser. Please use Chrome or Edge.'
      );
      return;
    }

    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListening(true);
      setVoiceError('');
    };

    recognition.onresult = (event) => {
      const transcript =
        event.results?.[0]?.[0]?.transcript || '';

      setInput((current) =>
        current
          ? `${current} ${transcript}`.trim()
          : transcript.trim()
      );
    };

    recognition.onerror = (event) => {
      if (event.error === 'not-allowed') {
        setVoiceError(
          'Microphone permission was denied. Allow microphone access in the browser.'
        );
      } else {
        setVoiceError(
          `Voice recognition error: ${event.error}`
        );
      }

      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (error) {
      setListening(false);
      setVoiceError(error.message);
    }
  };

  const send = async () => {
    if (!input.trim() || busy) return;

    const question = input.trim();

    setInput('');

    setHistory((old) => [
      ...old,
      {
        who: 'You',
        text: question,
      },
    ]);

    setBusy(true);

    try {
      const data = await api('/assistant/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: question,
        }),
      });

      setHistory((old) => [
        ...old,
        {
          who: 'AI',
          text: data?.answer || 'No answer returned.',
        },
      ]);
    } catch (error) {
      setHistory((old) => [
        ...old,
        {
          who: 'AI',
          text:
            error?.message ||
            'Unable to get an answer right now.',
        },
      ]);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  return (
    <Module
      title="AI Exam Assistant"
      subtitle="Ask academic questions by typing or using your microphone."
    >
      <div className="chat">
        <div className="chat-history">
          {history.map((item, index) => (
            <div
              className={
                item.who === 'AI'
                  ? 'bubble ai'
                  : 'bubble'
              }
              key={index}
            >
              <b>{item.who}</b>
              <p>{String(item.text || '')}</p>
            </div>
          ))}

          {!history.length && (
            <Empty text="Ask a question or tap the microphone to speak." />
          )}
        </div>

        {voiceError && (
          <div className="alert error">
            {voiceError}
          </div>
        )}

        <div
          className="chat-input"
          style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
          }}
        >
          <input
            style={{ flex: 1 }}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') send();
            }}
            placeholder="Type your question..."
          />

          <button
            type="button"
            className={listening ? 'primary' : 'secondary'}
            onClick={startVoice}
            title={
              listening
                ? 'Stop voice input'
                : 'Start voice input'
            }
          >
            {listening ? (
              <MicOff size={17} />
            ) : (
              <Mic size={17} />
            )}
            {listening ? 'Stop' : 'Voice'}
          </button>

          <button
            type="button"
            className="primary"
            disabled={busy || !input.trim()}
            onClick={send}
          >
            <MessageSquare size={16} />
            {busy ? 'Thinking…' : 'Ask'}
          </button>
        </div>
      </div>
    </Module>
  );
}
function Assistant() {
  const [input, setInput] = useState('');
  const [history, setHistory] = usePersistedState(
    'aiqpg_assistant_history',
    []
  );
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const recognitionRef = useRef(null);

  const startVoice = () => {
    setVoiceError('');

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceError(
        'Voice input is not supported in this browser. Please use Chrome or Edge.'
      );
      return;
    }

    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListening(true);
      setVoiceError('');
    };

    recognition.onresult = (event) => {
      const transcript =
        event.results?.[0]?.[0]?.transcript || '';

      setInput((current) =>
        current
          ? `${current} ${transcript}`.trim()
          : transcript.trim()
      );
    };

    recognition.onerror = (event) => {
      if (event.error === 'not-allowed') {
        setVoiceError(
          'Microphone permission was denied. Allow microphone access in the browser.'
        );
      } else {
        setVoiceError(
          `Voice recognition error: ${event.error}`
        );
      }

      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (error) {
      setListening(false);
      setVoiceError(error.message);
    }
  };

  const send = async () => {
    if (!input.trim() || busy) return;

    const question = input.trim();

    setInput('');

    setHistory((old) => [
      ...old,
      {
        who: 'You',
        text: question,
      },
    ]);

    setBusy(true);

    try {
      const data = await api('/assistant/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: question,
        }),
      });

      setHistory((old) => [
        ...old,
        {
          who: 'AI',
          text: data?.answer || 'No answer returned.',
        },
      ]);
    } catch (error) {
      setHistory((old) => [
        ...old,
        {
          who: 'AI',
          text:
            error?.message ||
            'Unable to get an answer right now.',
        },
      ]);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  return (
    <Module
      title="AI Exam Assistant"
      subtitle="Ask academic questions by typing or using your microphone."
    >
      <div className="chat">
        <div className="chat-history">
          {history.map((item, index) => (
            <div
              className={
                item.who === 'AI'
                  ? 'bubble ai'
                  : 'bubble'
              }
              key={index}
            >
              <b>{item.who}</b>
              <p>{String(item.text || '')}</p>
            </div>
          ))}

          {!history.length && (
            <Empty text="Ask a question or tap the microphone to speak." />
          )}
        </div>

        {voiceError && (
          <div className="alert error">
            {voiceError}
          </div>
        )}

        <div
          className="chat-input"
          style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
          }}
        >
          <input
            style={{ flex: 1 }}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') send();
            }}
            placeholder="Type your question..."
          />

          <button
            type="button"
            className={listening ? 'primary' : 'secondary'}
            onClick={startVoice}
            title={
              listening
                ? 'Stop voice input'
                : 'Start voice input'
            }
          >
            {listening ? (
              <MicOff size={17} />
            ) : (
              <Mic size={17} />
            )}
            {listening ? 'Stop' : 'Voice'}
          </button>

          <button
            type="button"
            className="primary"
            disabled={busy || !input.trim()}
            onClick={send}
          >
            <MessageSquare size={16} />
            {busy ? 'Thinking…' : 'Ask'}
          </button>
        </div>
      </div>
    </Module>
  );
}
function DatabaseConsole(){
 const defaultTables=['answer_keys','audit_logs','blueprints','login_sessions','papers','previous_papers','questions','settings','subjects','syllabi','users','vault_items'];
 const[tables,setTables]=useState(defaultTables),[selected,setSelected]=useState('users'),[columns,setColumns]=useState([]),[rows,setRows]=useState([]),[total,setTotal]=useState(0),[loading,setLoading]=useState(false),[msg,setMsg]=useState(''),[search,setSearch]=useState(''),[inspectRow,setInspectRow]=useState(null);

 const loadTables=async()=>{
  try{
   const d=await api('/admin/tables');
   const list=Array.isArray(d?.tables)&&d.tables.length?d.tables:defaultTables;
   setTables(list);
   if(!list.includes(selected))setSelected(list[0]||'users');
  }catch{
   setTables(defaultTables);
  }
 };

 const loadTable=async(tableName=selected)=>{
  if(!tableName)return;
  setLoading(true);
  setMsg('');
  try{
   const d=await api(`/admin/tables/${encodeURIComponent(tableName)}`);
   setColumns(Array.isArray(d?.columns)?d.columns:[]);
   setRows(Array.isArray(d?.rows)?d.rows:[]);
   setTotal(Number(d?.total_records??d?.total??(d?.rows?.length||0)));
  }catch(e){
   setColumns([]);
   setRows([]);
   setTotal(0);
   setMsg(e.message||'Unable to load table data.');
  }finally{
   setLoading(false);
  }
 };

 useEffect(()=>{loadTables()},[]);
 useEffect(()=>{loadTable(selected)},[selected]);

 const filtered=useMemo(()=>{
  const q=search.trim().toLowerCase();
  if(!q)return rows;
  return rows.filter(r=>columns.some(c=>String(r[c]??'').toLowerCase().includes(q)));
 },[rows,columns,search]);

 return <Module title="Database Console" subtitle="View and inspect all stored SQLite values across system tables." actions={<button className="secondary" onClick={()=>loadTable()} disabled={loading}><RefreshCw size={15}/>{loading?'Loading…':'Refresh Table'}</button>}>
  {msg&&<div className="alert error">{msg}</div>}
  <div className="db-console">
   <div className="db-sidebar">
    <div className="db-sidebar-title"><b>SQLite Tables</b><span>{tables.length}</span></div>
    {tables.map(t=><button key={t} className={selected===t?'db-table-btn active':'db-table-btn'} onClick={()=>{setSelected(t);setSearch('');setInspectRow(null)}}>{t}</button>)}
   </div>
   <div className="db-main">
    <div className="db-toolbar">
     <div><b>{selected||'No table'}</b><span>{total} stored record{total===1?'':'s'}</span></div>
     <input className="db-search" value={search} onChange={e=>setSearch(e.target.value)} placeholder={`Filter ${selected}...`}/>
    </div>
    {loading?<div className="empty">Loading {selected} data…</div>:columns.length?<div className="table-wrap db-data-wrap">
     <table>
      <thead>
       <tr>
        <th>Action</th>
        {columns.map(c=><th key={c}>{c.replaceAll('_',' ')}</th>)}
       </tr>
      </thead>
      <tbody>
       {filtered.map((r,i)=><tr key={r.id??i}>
        <td><button className="table-icon" style={{fontSize:'11px',padding:'4px 8px'}} onClick={()=>setInspectRow(r)}>Inspect</button></td>
        {columns.map(c=><td key={c}>{String(r[c]??'—').slice(0,180)}</td>)}
       </tr>)}
      </tbody>
     </table>
     {!filtered.length&&<Empty text={`No matching records stored in '${selected}'.`}/>}
    </div>:<Empty text="No table schema or rows found."/>}
    <div className="db-footer">Showing {filtered.length} of {total} stored values in {selected}. Click inspect to view full record details.</div>
   </div>
  </div>

  {inspectRow&&<div className="form-card" style={{marginTop:'16px',background:'#fafbfc'}}>
   <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'10px'}}>
    <h3 style={{margin:0}}>Record Details — {selected} #{inspectRow.id??''}</h3>
    <button className="secondary" onClick={()=>setInspectRow(null)}>Close</button>
   </div>
   <pre style={{background:'#101927',color:'#84d0ff',padding:'14px',borderRadius:'10px',overflow:'auto',maxHeight:'320px',fontSize:'12px',lineHeight:'1.5'}}>
    {JSON.stringify(inspectRow,null,2)}
   </pre>
  </div>}
 </Module>
}

function UserManagement(){
 const[users,setUsers]=useState([]),[msg,setMsg]=useState(''),[search,setSearch]=useState(''),[showAdd,setShowAdd]=useState(false),[editUser,setEditUser]=useState(null),[resetUser,setResetUser]=useState(null);
 const emptyForm={name:'',email:'',password:'',role:'faculty',department:''};
 const[form,setForm]=useState(emptyForm);
 const[newPass,setNewPass]=useState('');
 const[loading,setLoading]=useState(false);

 const load=async()=>{
  try{
   const d=await api('/admin/users');
   setUsers(Array.isArray(d)?d:d?.users||[]);
  }catch(e){
   setMsg(e.message);
  }
 };
 useEffect(()=>{load()},[]);

 const saveNewUser=async e=>{
  e.preventDefault();
  setLoading(true);
  setMsg('');
  try{
   await api('/admin/users',{method:'POST',body:JSON.stringify(form)});
   setMsg(`User ${form.email} created successfully.`);
   setShowAdd(false);
   setForm(emptyForm);
   load();
  }catch(e){
   setMsg(e.message);
  }finally{
   setLoading(false);
  }
 };

 const saveEditUser=async e=>{
  e.preventDefault();
  if(!editUser)return;
  setLoading(true);
  setMsg('');
  try{
   await api(`/admin/users/${editUser.id}`,{method:'PUT',body:JSON.stringify({name:form.name,email:form.email,role:form.role,department:form.department})});
   setMsg(`User updated successfully.`);
   setEditUser(null);
   setForm(emptyForm);
   load();
  }catch(e){
   setMsg(e.message);
  }finally{
   setLoading(false);
  }
 };

 const runResetPassword=async e=>{
  e.preventDefault();
  if(!resetUser||!newPass.trim())return;
  setLoading(true);
  setMsg('');
  try{
   await api(`/admin/users/${resetUser.id}/reset-password`,{method:'PUT',body:JSON.stringify({password:newPass.trim()})});
   setMsg(`Password reset for ${resetUser.email}.`);
   setResetUser(null);
   setNewPass('');
  }catch(e){
   setMsg(e.message);
  }finally{
   setLoading(false);
  }
 };

 const deleteUser=async u=>{
  if(!confirm(`Delete account for ${u.name} (${u.email})?`))return;
  try{
   const d=await api(`/admin/users/${u.id}`,{method:'DELETE'});
   setMsg(d.message||'User deleted.');
   load();
  }catch(e){
   setMsg(e.message);
  }
 };

 const filtered=users.filter(u=>(u.name+' '+u.email+' '+u.role+' '+(u.department||'')).toLowerCase().includes(search.toLowerCase()));

 return <Module title="User Management" subtitle="Create, edit roles, reset passwords and delete user accounts." actions={<button className="primary" onClick={()=>{setForm(emptyForm);setEditUser(null);setShowAdd(true)}}><Plus size={16}/> Add User</button>}>
  {msg&&<div className="notice">{msg}</div>}
  <div className="filter-row"><input placeholder="Search users by name, email, role or department..." value={search} onChange={e=>setSearch(e.target.value)}/></div>

  {showAdd&&<div className="form-card">
   <h3>Add New User</h3>
   <form onSubmit={saveNewUser}>
    <div className="form-grid">
     <Field label="Full Name"><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/></Field>
     <Field label="College Email (@apollouniversity.edu.in)"><input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required/></Field>
     <Field label="Initial Password"><input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} minLength="8" required/></Field>
     <Field label="Role"><select value={form.role} onChange={e=>setForm({...form,role:e.target.value})}><option value="faculty">Faculty</option><option value="admin">Administrator</option></select></Field>
     <Field label="Department"><input value={form.department} onChange={e=>setForm({...form,department:e.target.value})} placeholder="CSE / ECE / Mechanical"/></Field>
    </div>
    <div className="actions">
     <button className="primary" disabled={loading}>{loading?'Saving…':'Create User'}</button>
     <button type="button" className="secondary" onClick={()=>setShowAdd(false)}>Cancel</button>
    </div>
   </form>
  </div>}

  {editUser&&<div className="form-card">
   <h3>Edit User #{editUser.id}</h3>
   <form onSubmit={saveEditUser}>
    <div className="form-grid">
     <Field label="Full Name"><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/></Field>
     <Field label="College Email"><input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required/></Field>
     <Field label="Role"><select value={form.role} onChange={e=>setForm({...form,role:e.target.value})}><option value="faculty">Faculty</option><option value="admin">Administrator</option></select></Field>
     <Field label="Department"><input value={form.department} onChange={e=>setForm({...form,department:e.target.value})}/></Field>
    </div>
    <div className="actions">
     <button className="primary" disabled={loading}>{loading?'Saving…':'Update User'}</button>
     <button type="button" className="secondary" onClick={()=>setEditUser(null)}>Cancel</button>
    </div>
   </form>
  </div>}

  {resetUser&&<div className="form-card">
   <h3>Reset Password for {resetUser.name} ({resetUser.email})</h3>
   <form onSubmit={runResetPassword}>
    <div className="form-grid">
     <Field label="New Password (min 8 chars)"><input type="password" value={newPass} onChange={e=>setNewPass(e.target.value)} minLength="8" required/></Field>
    </div>
    <div className="actions">
     <button className="primary" disabled={loading}>{loading?'Resetting…':'Set New Password'}</button>
     <button type="button" className="secondary" onClick={()=>setResetUser(null)}>Cancel</button>
    </div>
   </form>
  </div>}

  <div className="table-wrap">
   <table>
    <thead>
     <tr>
      <th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Department</th><th>Last Login</th><th>Actions</th>
     </tr>
    </thead>
    <tbody>
     {filtered.map(u=><tr key={u.id}>
      <td>#{u.id}</td>
      <td><b>{u.name}</b></td>
      <td>{u.email}</td>
      <td><span style={{padding:'3px 8px',borderRadius:'12px',fontSize:'11px',background:u.role==='admin'?'#e0e7ff':'#f3f4f6',color:u.role==='admin'?'#3730a3':'#374151'}}>{u.role}</span></td>
      <td>{u.department||'—'}</td>
      <td>{u.last_login?new Date(u.last_login).toLocaleString():'Never'}</td>
      <td>
       <div style={{display:'flex',gap:'6px'}}>
        <button className="secondary" style={{padding:'4px 8px',fontSize:'11px'}} onClick={()=>{setEditUser(u);setForm({name:u.name,email:u.email,password:'',role:u.role,department:u.department||''});setShowAdd(false)}}>Edit</button>
        <button className="secondary" style={{padding:'4px 8px',fontSize:'11px'}} onClick={()=>setResetUser(u)}>Password</button>
        <button className="secondary" style={{padding:'4px 8px',fontSize:'11px',color:'#dc2626'}} onClick={()=>deleteUser(u)}>Delete</button>
       </div>
      </td>
     </tr>)}
    </tbody>
   </table>
   {!filtered.length&&<Empty text="No users found."/>}
  </div>
 </Module>
}

function ActivityLogs(){
 const[logs,setLogs]=useState([]),[search,setSearch]=useState(''),[loading,setLoading]=useState(false);
 const load=async()=>{
  setLoading(true);
  try{
   const d=await api('/admin/logs');
   setLogs(Array.isArray(d)?d:[]);
  }catch{}
  finally{setLoading(false)}
 };
 useEffect(()=>{load()},[]);
 const filtered=logs.filter(l=>(String(l.action)+' '+String(l.user_id)+' '+String(l.details)).toLowerCase().includes(search.toLowerCase()));
 return <Module title="Activity Logs" subtitle="Audit trail of all administrative and system operations." actions={<button className="secondary" onClick={load} disabled={loading}><RefreshCw size={15}/>{loading?'Loading…':'Refresh'}</button>}>
  <div className="filter-row"><input placeholder="Search logs by action, user ID or details..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
  <Table rows={filtered} cols={['id','user_id','action','details','created_at']}/>
 </Module>
}

function LoginSessions(){
 const[sessions,setSessions]=useState([]),[search,setSearch]=useState(''),[msg,setMsg]=useState(''),[loading,setLoading]=useState(false);
 const load=async()=>{
  setLoading(true);
  try{
   const d=await api('/admin/sessions');
   setSessions(Array.isArray(d)?d:[]);
  }catch(e){setMsg(e.message)}
  finally{setLoading(false)}
 };
 useEffect(()=>{load()},[]);

 const terminate=async id=>{
  try{
   await api(`/admin/sessions/${id}/terminate`,{method:'POST'});
   setMsg(`Session #${id} terminated.`);
   load();
  }catch(e){setMsg(e.message)}
 };

 const filtered=sessions.filter(s=>(String(s.user_id)+' '+String(s.status)+' '+String(s.ip_address)).toLowerCase().includes(search.toLowerCase()));
 return <Module title="Login Sessions" subtitle="Monitor active and past user authentication sessions." actions={<button className="secondary" onClick={load} disabled={loading}><RefreshCw size={15}/>{loading?'Loading…':'Refresh'}</button>}>
  {msg&&<div className="notice">{msg}</div>}
  <div className="filter-row"><input placeholder="Search login sessions..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
  <div className="table-wrap">
   <table>
    <thead>
     <tr>
      <th>Session ID</th><th>User ID</th><th>Login Time</th><th>Logout Time</th><th>IP Address</th><th>Status</th><th>Action</th>
     </tr>
    </thead>
    <tbody>
     {filtered.map(s=><tr key={s.id}>
      <td>#{s.id}</td>
      <td>User #{s.user_id}</td>
      <td>{s.login_at?new Date(s.login_at).toLocaleString():'—'}</td>
      <td>{s.logout_at?new Date(s.logout_at).toLocaleString():'—'}</td>
      <td>{s.ip_address||'Localhost'}</td>
      <td><span style={{padding:'3px 8px',borderRadius:'12px',fontSize:'11px',background:s.status==='active'?'#dcfce7':'#f3f4f6',color:s.status==='active'?'#166534':'#374151'}}>{s.status}</span></td>
      <td>
       {s.status==='active'&&<button className="secondary" style={{padding:'4px 8px',fontSize:'11px',color:'#dc2626'}} onClick={()=>terminate(s.id)}>Terminate</button>}
      </td>
     </tr>)}
    </tbody>
   </table>
   {!filtered.length&&<Empty text="No sessions found."/>}
  </div>
 </Module>
}

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem('aiqpg_user')
      );
    } catch {
      return null;
    }
  });

  const [page, setPage] =
    useState('Dashboard');

  useEffect(() => {
    document.body.dataset.theme =
      localStorage.getItem(
        `aiqpg_${user?.id ?? user?.email ?? 'guest'}_theme`
      ) || 'light';
  }, [user?.id, user?.email]);

  if (!user) {
    return <Auth onLogin={setUser} />;
  }

  const admin = user.role === 'admin';

  const menu = admin
    ? ADMIN_NAV
    : FACULTY_NAV;

  const navigate = (nextPage) => {
    if (!nextPage) return;

    setPage(nextPage);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const renderPage = () => {
    if (page === 'Dashboard') {
      return admin ? (
        <AdminDashboard
          user={user}
          go={navigate}
        />
      ) : (
        <Dashboard
          user={user}
          go={navigate}
        />
      );
    }

    if (
      !admin &&
      page === 'Subject Management'
    ) {
      return <SubjectManagement />;
    }

    if (
      !admin &&
      page === 'Syllabus Analyzer'
    ) {
      return <SyllabusAnalyzer />;
    }

    if (
      !admin &&
      page === 'Question Bank'
    ) {
      return <QuestionBank />;
    }

    if (
      !admin &&
      page === 'Blueprint Designer'
    ) {
      return <BlueprintDesigner />;
    }

    if (
      !admin &&
      page === 'AI Paper Generator'
    ) {
      return <PaperGenerator />;
    }

    if (
      !admin &&
      page === 'Previous Paper Analyzer'
    ) {
      return <PreviousAnalyzer />;
    }

    if (
      !admin &&
      page === 'Answer Key Generator'
    ) {
      return <AnswerKeys />;
    }

    if (
      !admin &&
      page === 'Paper Vault'
    ) {
      return <Vault />;
    }

    if (
      !admin &&
      page === 'AI Exam Assistant'
    ) {
      return <Assistant />;
    }

    if (page === 'Settings') {
      return <SettingsPage user={user} />;
    }

    if (
      admin &&
      page === 'User Management'
    ) {
      return <UserManagement />;
    }

    if (
      admin &&
      page === 'Database Console'
    ) {
      return <DatabaseConsole />;
    }

    if (
      admin &&
      page === 'Activity Logs'
    ) {
      return <ActivityLogs />;
    }

    if (
      admin &&
      page === 'Login Sessions'
    ) {
      return <LoginSessions />;
    }

    return admin ? (
      <AdminDashboard
        user={user}
        go={navigate}
      />
    ) : (
      <Dashboard
        user={user}
        go={navigate}
      />
    );
  };

  const signout = async () => {
    try {
      await api('/auth/logout', {
        method: 'POST',
      });
    } catch {}

    localStorage.removeItem(
      'aiqpg_token'
    );

    localStorage.removeItem(
      'aiqpg_user'
    );

    setUser(null);
    setPage('Dashboard');
  };

  return (
    <div className="app">

      <aside>
        <div className="logo">
          <div>AI</div>
          <span>AIQPG</span>
        </div>

        <div className="role-pill">
          {admin
            ? 'Administrator'
            : 'Faculty'}
        </div>

        <nav>
          {menu.map(
            ([name, Icon]) => (
              <button
                type="button"
                className={
                  page === name
                    ? 'active'
                    : ''
                }
                key={name}
                onClick={() =>
                  navigate(name)
                }
              >
                <Icon size={18} />
                {name}
              </button>
            )
          )}
        </nav>

        <button
          type="button"
          className="signout"
          onClick={signout}
        >
          <LogOut size={17} />
          Sign Out
        </button>
      </aside>

      <main>
        <header>
          <span>{page}</span>
          <span>{user.email}</span>
        </header>

        <div className="page-content">
          <PageErrorBoundary
            page={page}
            key={page}
          >
            {renderPage()}
          </PageErrorBoundary>
        </div>
      </main>

    </div>
  );
}
