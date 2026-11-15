"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { decideSubmission, withdrawApproval } from "./actions"
export function ReviewControls({id,revision}:{id:string;revision:number}) {
  const router=useRouter()
  const [busy,setBusy]=useState(false)
  const [reason,setReason]=useState("")
  const [message,setMessage]=useState("")
  async function decide(decision:"approved"|"rejected"){
    if(decision==="rejected"&&!reason.trim()){setMessage("Add a brief rejection reason.");return}
    setBusy(true);setMessage("")
    try{await decideSubmission(id,revision,decision,reason);setMessage(decision==="approved"?"Approved.":"Rejected.");router.refresh()}catch(e){setMessage(e instanceof Error?e.message:"Decision failed.")}
    finally{setBusy(false)}
  }
  return <div className="space-y-2"><label className="block text-xs">Reason for rejection (required if rejecting)<textarea value={reason} onChange={e=>setReason(e.target.value)} maxLength={400} className="mt-1 block w-full rounded border border-white/20 bg-black/40 p-2"/></label><div className="flex gap-3"><button disabled={busy} className="rounded bg-green-700 px-4 py-2 font-bold disabled:opacity-50" onClick={()=>decide("approved")}>Approve</button><button disabled={busy} className="rounded border border-white/30 px-4 py-2 font-bold disabled:opacity-50" onClick={()=>decide("rejected")}>Reject</button></div><p role="status" className="text-xs text-white/70">{message}</p></div>
}

export function WithdrawControl({id}:{id:string}) {
  const [busy,setBusy]=useState(false)
  const [message,setMessage]=useState("")
  const router=useRouter()
  return <div><button disabled={busy} className="rounded border border-red-500/50 px-3 py-2 text-xs font-bold disabled:opacity-50" onClick={async()=>{
    if(!confirm("Withdraw this approved card from public access?"))return
    setBusy(true)
    try {await withdrawApproval(id); router.refresh()}catch(e){setMessage(e instanceof Error?e.message:"Unable to withdraw.")}
    finally {setBusy(false)}
  }}>Withdraw public card</button><p role="status" className="text-xs">{message}</p></div>
}
