import { useContext } from 'react';
import { SioContext, SioDispatchContext } from '../SioProvider';
import { Visibility } from '@/server/Room';

export default function RoomDisplay() {
  const sio = useContext(SioContext);
  const dispatch = useContext(SioDispatchContext);
  return (
    sio?.room && (
      <div className='bg-blue-100 p-4'>
        hey you're in a room rn
        {Object.entries({
          name: sio.room.getDetails().config?.name,
          people: [...sio.room.getMembers()]
            .map(([_id, member]) => member.name)
            .join(' '),
        }).map(([k, v], index) => (
          <div className='flex gap-2 bg-blue-200' key={index}>
            <div>{k}</div>
            <div>{v}</div>
          </div>
        ))}
        {sio.room.getHost() === sio.memberId && (
          <button
            onClick={() => {
              dispatch &&
                dispatch({
                  type: 'start',
                });
            }}
          >
            Start
          </button>
        )}
      </div>
    )
  );
}
