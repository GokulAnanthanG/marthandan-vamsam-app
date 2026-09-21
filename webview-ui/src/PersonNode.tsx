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

const PersonCard = ({ member, isSpouse = false, highlighted = false }: { member: MemberData, isSpouse?: boolean, highlighted?: boolean }) => {
  const borderColor = member.gender === 'FEMALE' ? '#F06292' : member.gender === 'MALE' ? '#42A5F5' : '#E5DDCF';
  const initial = member.name ? member.name.charAt(0).toUpperCase() : '';
  const isFounder = member.jobTitle?.toLowerCase() === 'founder';

  if (member.isFadedSkeleton) {
    return (
      <div className={`person-card skeleton`} style={{ borderTopColor: borderColor }} onClick={() => {
        window.dispatchEvent(new CustomEvent('NODE_LOADING', { detail: member._id }));
        (window as any).ReactNativeWebView?.postMessage(JSON.stringify({ type: 'LOAD_MORE', memberId: member._id }));
      }}>
        <div className="skeleton-content">
          <span>{member.name}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`person-card ${isSpouse ? 'spouse' : ''} ${highlighted && !isSpouse ? 'highlighted' : ''}`} style={{ borderTopColor: borderColor }} onClick={() => (window as any).ReactNativeWebView?.postMessage(JSON.stringify({ type: 'NODE_CLICK', memberId: member._id }))}>
      
      {isFounder && (
        <div className="crown-icon">
          <span style={{fontSize: 12}}>👑</span>
        </div>
      )}

      <div className="card-inner">
        <div className="photo-container">
          {member.photoUrl ? (
            <img src={member.photoUrl} alt={member.name} className="person-photo" />
          ) : (
            <div className="person-photo placeholder">
              {initial}
            </div>
          )}
        </div>

        <div className="person-details">
          <div className="person-name">{member.name}</div>
        </div>
      </div>
    </div>
  );
};

export default function PersonNode({ data }: { data: { member: MemberData, spouse?: MemberData, highlighted?: boolean, hasParent?: boolean, hasChildren?: boolean } }) {
  return (
    <div className="person-node-container">
      {data.hasParent && <Handle type="target" position={Position.Top} className="handle top" />}
      
      <div className="node-content">
        <PersonCard member={data.member} highlighted={data.highlighted} />
        
        {data.spouse && (
          <>
            <div className="spouse-connector" />
            <PersonCard member={data.spouse} isSpouse={true} />
          </>
        )}
      </div>

      {data.hasChildren && <Handle type="source" position={Position.Bottom} className="handle bottom" />}
    </div>
  );
}
