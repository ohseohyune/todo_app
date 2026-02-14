
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
    if (user.totalXP < cost) {
      alert(`에너지가 부족합니다! (필요: ${cost} XP, 보유: ${user.totalXP} XP)\n퀘스트를 더 완료하고 오세요!`);
      return;
    }
    
    if (onBuyItem(id, cost)) {
      alert("구매가 완료되었습니다! 아이템이 인벤토리에 추가되었습니다. ✨");
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn h-full">
      <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border-2 border-[#1E3614] text-center">
        <span className="text-[10px] font-black text-[#3D2B1F44] uppercase tracking-widest block mb-2">보유 중인 에너지</span>
        <div className="flex items-center justify-center gap-2">
          <span className="text-3xl">⭐</span>
          <span className="text-4xl font-black text-[#3D2B1F] tracking-tighter">{user.totalXP}</span>
        </div>
      </div>

      <section className="flex-1 flex flex-col gap-4">
        {items.map((item) => (
          <div key={item.id} className={`bg-white p-5 rounded-3xl border-2 border-white/10 shadow-sm flex items-center gap-5 transition-all ${item.disabled ? 'opacity-50' : 'hover:border-[#2D4F1E]'}`}>
            <div className="w-16 h-16 bg-[#F4F2F0] rounded-2xl flex items-center justify-center text-4xl">{item.icon}</div>
            <div className="flex-1">
              <h4 className="font-black text-[#3D2B1F] text-base">{item.name}</h4>
              <p className="text-[10px] font-bold text-[#3D2B1F66] leading-tight mt-1">{item.description}</p>
              <div className="flex items-center gap-4 mt-3">
                <button 
                  onClick={() => handlePurchase(item.id, item.cost)}
                  disabled={item.disabled || user.totalXP < item.cost}
                  className={`px-4 py-1.5 rounded-xl font-black text-xs flex items-center gap-1 transition-all ${
                    item.disabled || user.totalXP < item.cost
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-[#2D4F1E] text-white shadow-[0_2px_0_#1E3614] active:translate-y-0.5'
                  }`}
                >
                  <span>{item.cost} XP</span>
                </button>
                <span className="text-[10px] font-black text-[#3D2B1F44]">보유: {item.owned}</span>
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default ShopScreen;
