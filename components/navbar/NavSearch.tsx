'use client';
// 宣告這是 Next.js 的 Client Component，因為用到 hooks (useState/useEffect)

import { Input } from '../ui/input';
import { useSearchParams, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { useState, useEffect } from 'react';

function NavSearch() {
  // 取得當前 URL 上的搜尋參數 (ReadOnlyURLSearchParams)
  const searchParams = useSearchParams();

  // router.replace 用來更新 URL，而不會重新加載整個頁面
  const { replace } = useRouter();

  // 本地 state，初始值從 searchParams.get('search') 讀取
  const [search, setSearch] = useState(
    searchParams.get('search')?.toString() || ''
  );

  // 建立一個防抖 (debounced) 的搜尋函式
  // 只有使用者停止輸入超過 500ms 才會真正執行
  const handleSearch = useDebouncedCallback((value: string) => {
    // 複製一份可修改的 URLSearchParams
    const params = new URLSearchParams(searchParams);

    // 如果有輸入值，設定 search 參數；否則刪除
    if (value) {
      params.set('search', value);
    } else {
      params.delete('search');
    }

    // 用 replace 更新網址列，但不刷新頁面
    replace(`/products?${params.toString()}`);
  }, 500);

  // 監聽網址上的 search 參數變化
  // 如果網址上沒有 search 參數，則把輸入框清空
  useEffect(() => {
    if (!searchParams.get('search')) {
      setSearch('');
    }
  }, [searchParams.get('search')]);

  return (
    <Input
      type="search"
      placeholder="search product..."
      className="max-w-xs dark:bg-muted"
      onChange={(e) => {
        // 更新本地 state
        setSearch(e.target.value);
        // 觸發 debounced 搜尋函式 (延遲 500ms)
        handleSearch(e.target.value);
      }}
      // 輸入框綁定 state
      value={search}
    />
  );
}

export default NavSearch;
