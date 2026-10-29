import React from "react";
import { ShieldCheck } from "lucide-react";

export default function Brand() {
  return (
    <div className="brand">
      <div className="brand-mark">
        <ShieldCheck size={35} strokeWidth={2.7} />
      </div>
      <div>
        <div className="brand-name">
          Brand<span>Guard</span>
        </div>
        <div className="brand-tag">Content · Trust · Grow</div>
      </div>
    </div>
  );
}
