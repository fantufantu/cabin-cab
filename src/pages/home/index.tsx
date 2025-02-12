import { Input, Button } from 'musae'

const Home = () => {
  return (
    <div className='flex flex-col gap-8'>
      <div>
        <Input variant='standard' />
      </div>

      <div style={{ backgroundColor: 'var(--on-primary)' }} className='px-9 py-8 rounded-[20px]'>
        <h1 className='text-3xl'>Today Task</h1>
        <p className='mt-2'>Check your daily tasks and schedules</p>
        <Button className='mt-4'>Today’s schedule</Button>
      </div>
    </div>
  )
}

export default Home
