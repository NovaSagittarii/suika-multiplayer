import { useContext } from 'react';
import { SioContext, SioDispatchContext } from '../SioProvider';
import { Visibility } from '@/server/Room';

export default function RoomListing() {
  const sio = useContext(SioContext);
  const dispatch = useContext(SioDispatchContext);
  return (
    <div>
      <div className='flex gap-4 bg-slate-100 p-4'>
        debug buttons
        <button
          onClick={() => {
            if (dispatch)
              dispatch({ type: 'create', visibility: Visibility.PUBLIC });
          }}
        >
          create
        </button>
        <button
          onClick={() => {
            if (dispatch) dispatch({ type: 'list' });
          }}
        >
          refresh list
        </button>
      </div>
      <div className='flex flex-col bg-white'>
        {sio?.roomListing &&
          sio.roomListing.map(
            ({ name, id, size, capacity }, index) =>
              id && (
                <div className='p-2' key={index}>
                  name={name}
                  id={id}({size}/{capacity})
                  <button
                    className='bg-black text-white font-bold text-sm p-1 rounded-sm hover:bg-slate-600 transition-colors'
                    onClick={() => {
                      dispatch &&
                        dispatch({
                          type: 'join',
                          roomId: id,
                        });
                    }}
                  >
                    JOIN
                  </button>
                </div>
              ),
          )}
      </div>
    </div>
  );
}
