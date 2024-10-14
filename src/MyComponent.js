import clsx from 'clsx';

const MyComponent = ({ isActive }) => {
   return (
       <div className={clsx({ 'active-class': isActive })}>
           Content here
       </div>
   );
};
export default MyComponent;