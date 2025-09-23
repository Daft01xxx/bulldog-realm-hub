import banImage from '@/assets/ban-image.png';

const Ban = () => {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4">
      <div className="max-w-md mx-auto text-center">
        <div className="mb-8">
          <img 
            src={banImage} 
            alt="BAN" 
            className="w-48 h-48 mx-auto object-contain"
          />
        </div>
        
        <div className="text-white text-lg leading-relaxed">
          Ваш аккаунт был забанен администрацией проекта без возможности восстановления.
          <br />
          <span className="text-red-500 font-semibold mt-2 block">Причина 5.1.</span>
        </div>
      </div>
    </div>
  );
};

export default Ban;