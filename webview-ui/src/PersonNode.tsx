import { Handle, Position } from '@xyflow/react';
import './PersonNode.css';

interface MemberData {
  _id: string;
  name: string;
  gender: string;
  photoUrl?: string;
  jobTitle?: string;
  dateOfBirth?: string;
  isFadedSkeleton?: boolean;
}

const PersonCard = ({ member, isSpouse = false }: { member: MemberData, isSpouse?: boolean }) => {
  const borderColor = member.gender === 'FEMALE' ? '#f06292' : member.gender === 'MALE' ? '#4dabf5' : '#888';
  
  if (member.isFadedSkeleton) {
    return (
      <div className={`person-card skeleton`} style={{ borderTopColor: borderColor }} onClick={() => (window as any).ReactNativeWebView?.postMessage(JSON.stringify({ type: 'LOAD_MORE', memberId: member._id }))}>
        <div className="skeleton-content">
          <span>{member.name}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`person-card ${isSpouse ? 'spouse' : ''}`} style={{ borderTopColor: borderColor }} onClick={() => (window as any).ReactNativeWebView?.postMessage(JSON.stringify({ type: 'NODE_CLICK', memberId: member._id }))}>
      <div className="card-inner">
        {member.photoUrl ? (
          <img src={member.photoUrl} alt={member.name} className="person-photo" />
        ) : (
          <div className="person-photo placeholder">
            {member.name.charAt(0)}
          </div>
        )}
        <div className="person-details">
          <div className="person-name">{member.name}</div>
          {member.jobTitle && <div className="person-job">{member.jobTitle}</div>}
          {member.dateOfBirth && <div className="person-date">{new Date(member.dateOfBirth).toLocaleDateString()}</div>}
        </div>
      </div>
    </div>
  );
};

export default function PersonNode({ data }: { data: { member: MemberData, spouse?: MemberData } }) {
  return (
    <div className="person-node-container">
      <Handle type="target" position={Position.Top} className="handle top" />
      
      <div className="node-content">
        <PersonCard member={data.member} />
        
        {data.spouse && (
          <>
            <div className="spouse-connector" />
            <PersonCard member={data.spouse} isSpouse={true} />
          </>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="handle bottom" />
    </div>
  );
}
