"use client"
import { useState } from "react"

export function Recommendation({teams,cutoff}:{teams:string[];cutoff:string}) {
  const [order,setOrder]=useState(teams)
  const [reason,setReason]=useState('')
  const [author,setAuthor]=useState('')
  const changed=order.some((id,i)=>id!==teams[i])
  function move(index:number,delta:number) {
    const next=[...order],destination=index+delta
    if(destination<0||destination>=next.length) return
    ;[next[index],next[destination]]=[next[destination],next[index]]
    setOrder(next)
  }
  function download() {
    if(!author.trim()||!reason.trim()) return
    const blob=new Blob([JSON.stringify({mode:'coach-adjusted suggestion',official:false,cutoff,baseline:teams,order,reason:reason.trim(),author:author.trim(),authorVerified:false,createdAt:new Date().toISOString()},null,2)],{type:'application/json'})
    const url=URL.createObjectURL(blob),a=document.createElement('a')
    a.href=url;a.download='group-b-coach-recommendation.json'
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(()=>URL.revokeObjectURL(url),1000)
  }
  return <section className="surface-card p-6"><h2 className="text-2xl font-bold">Coach recommendation</h2><p className="mt-3 text-sm text-muted-foreground">Start with the rating baseline. Explain any adjustment using the same evidence for every team. This draft stays in this tab; export it to retain it. Author names are self-reported under the shared coach login.</p><ol className="mt-5 space-y-2">{order.map((id,i)=><li key={id} className="flex items-center justify-between gap-3 border-b py-2"><span>{i+1}. {id}</span><div className="flex gap-2"><button type="button" aria-label={`Move ${id} up`} disabled={i===0} onClick={()=>move(i,-1)} className="rounded border px-3 py-1 disabled:opacity-30">↑</button><button type="button" aria-label={`Move ${id} down`} disabled={i===order.length-1} onClick={()=>move(i,1)} className="rounded border px-3 py-1 disabled:opacity-30">↓</button></div></li>)}</ol><p className="mt-4 text-sm font-semibold">{changed?'Coach-adjusted suggestion':'Unchanged rating baseline'} · unofficial</p><label className="mt-5 block text-sm font-bold" htmlFor="recommendation-author">Prepared by</label><input id="recommendation-author" value={author} onChange={e=>setAuthor(e.target.value)} className="mt-2 w-full rounded border bg-white p-3" /><label className="mt-4 block text-sm font-bold" htmlFor="recommendation-reason">Evidence and reason for this order</label><textarea id="recommendation-reason" value={reason} onChange={e=>setReason(e.target.value)} rows={4} className="mt-2 w-full rounded border bg-white p-3" /><div className="mt-4 flex flex-wrap gap-3"><button type="button" disabled={!author.trim()||!reason.trim()} onClick={download} className="rounded bg-primary px-4 py-2 font-bold text-white disabled:opacity-40">Export documented recommendation</button><button type="button" onClick={()=>{setOrder(teams);setReason('')}} className="rounded border px-4 py-2">Reset to baseline</button></div></section>
}
