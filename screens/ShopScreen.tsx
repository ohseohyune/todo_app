
import React from 'react';
import { User } from '../types';

interface ShopScreenProps {
  user: User;
  onBuyItem: (itemType: string, cost: number) => boolean;
}

const ShopScreen: React.FC<ShopScreenProps> = ({ user, onBuyItem }) => {
  const items = [
    {
      id: 'freeze',
      name: '스트릭 프리즈 (얼음꽃)',
      description: '너무 힘든 날, 하루 동안 당신의 스트릭을 안전하게 보호합니다.',
      cost: 300,
      icon: '❄️',
      owned: user.inventory.streakFreeze
    },
    {
      id: 'seed_pack',
      name: '희귀 씨앗 팩',
      description: '마음의 정원에 심을 수 있는 특별한 식물 씨앗을 얻습니다.',
      cost: 150,
      icon: '🎒',
      owned: 0
    },
    {
      id: 'focus_potion',
      name: '몰입의 물약',
      description: '다음 퀘스트 완료 시 XP를 2배로 획득합니다. (개발 예정)',
      cost: 500,
      icon: '🧪',
      owned: 0,
      disabled: true
    }
  ];

  const handlePurchase = (id: string, cost: number) => {
    if (onBuyItem(id, cost)) {
      alert("구매가 완료되었습니다! 아이템이 인벤토리에 추가되었습니다.");
    } else {
      alert("에너지(XP)가 부족합니다. 퀘스트를 더 완료해 보세요!");
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn h-full">
      <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border-2 border-[#1E3614] relative overflow-hidden text-center">
        <span className="text-[10px] font-black text-[#3D2B1F44] uppercase tracking-widest block mb-2">Current Balance</span>
        <div className="flex items-center justify-center gap-2">
          <span className="text-3xl">⭐</span>
          <span className="text-4xl font-black text-[#3D2B1F] tracking-tighter">{user.totalXP}</span>
        </div>
        <p className="text-xs font-bold text-[#2D4F1E] mt-3 uppercase tracking-tighter">에너지를 사용해 시스템 유지보수 도구를 획득하세요</p>
      </div>

      <section className="flex-1 flex flex-col gap-4">
        <div className="flex justify-between items-center ml-2">
          <h3 className="text-lg font-black text-white uppercase tracking-tight">Reward Depot</h3>
          <span className="text-[9px] font-bold text-white/40 mono uppercase tracking-widest">Available Tech</span>
        </div>

        {items.map((item) => (
          <div key={item.id} className={`bg-white p-5 rounded-3xl border-2 border-white/10 shadow-sm flex items-center gap-5 group transition-all ${item.disabled ? 'opacity-50' : 'hover:border-[#2D4F1E]'}`}>
            <div className="w-16 h-16 bg-[#F4F2F0] rounded-2xl flex items-center justify-center text-4xl border-2 border-white group-hover:scale-110 transition-transform">
              {item.icon}
            </div>
            
            <div className="flex-1">
              <h4 className="font-black text-[#3D2B1F] text-base">{item.name}</h4>
              <p className="text-[10px] font-bold text-[#3D2B1F66] leading-tight mt-1">
                {item.description}
              </p>
              <div className="flex items-center gap-4 mt-3">
                <button 
                  onClick={() => handlePurchase(item.id, item.cost)}
                  disabled={item.disabled}
                  className={`bg-[#2D4F1E] text-white px-4 py-1.5 rounded-xl font-black text-xs shadow-[0_2px_0_#1E3614] active:translate-y-0.5 active:shadow-none flex items-center gap-1 ${item.disabled ? 'bg-gray-400 border-gray-500 cursor-not-allowed shadow-none active:translate-y-0' : ''}`}
                >
                  <span>{item.cost} XP</span>
                </button>
                <span className="text-[10px] font-black text-[#3D2B1F44] uppercase tracking-widest">
                  보유량: {item.owned}
                </span>
              </div>
            </div>
          </div>
        ))}
      </section>

      <div className="bg-[#3D2B1F] p-5 rounded-[2.5rem] border-2 border-[#1E3614] shadow-xl text-center">
        <p className="text-[10px] text-white/60 font-black uppercase tracking-widest leading-relaxed">
          "진정한 보상은 물건이 아니라, <br/> 당신이 만든 지속적인 습관 그 자체입니다."
        </p>
      </div>
    </div>
  );
};

export default ShopScreen;
