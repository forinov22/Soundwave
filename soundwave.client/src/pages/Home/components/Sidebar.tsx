import home from '@/assets/home.png'
import search from '@/assets/search.png'
import stack from '@/assets/stack.png'
import arrow from '@/assets/arrow.png'
import plus from '@/assets/plus.png'

const Sidebar = () => {
  return (
    <div className="w-[25%] h-full p-2 flex-col gap-2 text-white hidden lg:flex">
      <div className="h-[15%] rounded bg-[#121212] flex flex-col justify-around">
        <div className="flex items-center gap-3 pl-8 cursor-pointer">
          <img src={home} alt="home" className="w-6" />
          <p className="font-bold">Home</p>
        </div>
        <div className="flex items-center gap-3 pl-8 cursor-pointer">
          <img src={search} alt="search" className="w-6" />
          <p className="font-bold">Search</p>
        </div>
      </div>
      <div className="h-[85%] rounded bg-[#121212]">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={stack} alt="stack" className="w-8" />
            <p className="font-semibold">Your Library</p>
          </div>
          <div className="flex items-center gap-3">
            <img src={arrow} alt="arrow" className="w-5" />
            <img src={plus} alt="plus" className="w-5" />
          </div>
        </div>
        <div className='m-2 p-4 bg-[#242424] rounded font-semibold flex flex-col items-start justify-start'>
            <h1>Create your first playlist</h1>
            <p className='font-light'>it's easy we will help you</p>
            <button className='mt-4 px-4 py-1.5 bg-white rounded-full text-[15px] text-black'>Create Playlist</button>
        </div>
        <div className='m-2 p-4 bg-[#242424] rounded font-semibold flex flex-col items-start justify-start mt-4'>
            <h1>Let's find some podcasts to follow</h1>
            <p className='font-light'>we'll keep you update on new episodes</p>
            <button className='mt-4 px-4 py-1.5 bg-white rounded-full text-[15px] text-black'>Browse Podcasts</button>
        </div>
      </div>
    </div>
  );
}

export default Sidebar