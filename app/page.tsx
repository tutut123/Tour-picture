'use client';
import React, { useState, useRef } from 'react';
import { Download, Plus, Trash2 } from 'lucide-react';

// 定义语言类型：中文或英文
type Language = 'zh' | 'en';

// 预览内容的中英文配置
const previewConfig = {
  zh: {
    mainTitle: '线路详情',
    startMark: '起',
    endMark: '终',
    fileName: '线路详情.png',
  },
  en: {
    mainTitle: 'Bus Line',
    startMark: '',
    endMark: '',
    fileName: 'bus-line.png',
  },
};

// 站点数据类型定义
type Station = {
  id: string;
  name: string;
  type: 'start' | 'end' | 'intermediate'; // 起点、终点、途经站
};

// 线路方向数据类型定义
type RouteDirection = {
  id: string;
  timeInfo: string;
  stations: Station[];
};

// 模板数据类型定义
type TemplateData = {
  directions: RouteDirection[];
};

export default function RouteGenerator() {
  // 状态管理：当前预览语言
  const [previewLang, setPreviewLang] = useState<Language>('zh');
  // 获取当前语言的配置
  const view = previewConfig[previewLang];
  // 状态管理：线路数据
  const [data, setData] = useState<TemplateData>({ directions: [] });
  // 引用：用于获取预览区域的 DOM 节点，以便导出图片
  const previewRef = useRef<HTMLDivElement>(null);

  // 功能：下载高清图片（扩大3倍）
  const handleDownload = async () => {
    if (previewRef.current) {
      try {
        // 动态导入 html-to-image 库
        const { toPng } = await import('html-to-image');
        // 将 DOM 转换为高清PNG：pixelRatio=4 代表尺寸扩大3倍，高清导出
        const url = await toPng(previewRef.current, { quality: 1, pixelRatio: 3 });
        // 创建下载链接并触发下载
        const a = document.createElement('a');
        a.download = view.fileName;
        a.href = url;
        a.click();
      } catch (err) {
        console.error('导出失败', err);
      }
    }
  };

  // 功能：更新运营时间说明
  const updateTime = (id: string, v: string) => {
    setData(p => ({
      ...p,
      directions: p.directions.map(d => d.id === id ? { ...d, timeInfo: v } : d),
    }));
  };

  // 功能：添加新线路
  const addLine = () => {
    setData(p => ({
      ...p,
      directions: [
        ...p.directions,
        {
          id: Date.now().toString(),
          timeInfo: '运营时间说明',
          stations: [
            { id: 's-' + Date.now(), name: '起点', type: 'start' },
            { id: 'e-' + Date.now(), name: '终点', type: 'end' },
          ],
        },
      ],
    }));
  };

  // 功能：删除线路
  const delLine = (id: string) => {
    setData(p => ({ ...p, directions: p.directions.filter(x => x.id !== id) }));
  };

  // 功能：更名称
  const updateStation = (dirId: string, stId: string, v: string) => {
    setData(p => ({
      ...p,
      directions: p.directions.map(d => {
        if (d.id !== dirId) return d;
        return {
          ...d,
          stations: d.stations.map(s => s.id === stId ? { ...s, name: v } : s),
        };
      }),
    }));
  };

  // 功能：插入途经站点
  const addMiddleStation = (dirId: string, idx: number) => {
    setData(p => ({
      ...p,
      directions: p.directions.map(d => {
        if (d.id !== dirId) return d;
        const s = [...d.stations];
        s.splice(idx + 1, 0, {
          id: 'm-' + Date.now(),
          name: '',
          type: 'intermediate',
        });
        return { ...d, stations: s };
      }),
    }));
  };

  // 功能：删除途经站点
  const delStation = (dirId: string, stId: string) => {
    setData(p => ({
      ...p,
      directions: p.directions.map(d => {
        if (d.id !== dirId) return d;
        return { ...d, stations: d.stations.filter(s => s.id !== stId) };
      }),
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* ========== 左侧编辑区（全程中文，固定样式）========== */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-[calc(100vh-4rem)] overflow-y-auto">
          {/* 编辑区标题 + 语言切换按钮 */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-black">编辑内容</h2>
            <button
              onClick={() => setPreviewLang(previewLang === 'zh' ? 'en' : 'zh')}
              className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-md font-semibold text-black"
            >
              {previewLang === 'zh' ? '切换预览为英文' : '切换预览为中文'}
            </button>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              {/* 线路列表标题 + 添加线路按钮 */}
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-black">线路列表</h3>
                <button
                  onClick={addLine}
                  className="flex items-center gap-1 text-sm text-green-600 font-semibold bg-green-50 px-3 py-1.5 rounded-md"
                >
                  <Plus size={16} /> 添加线路
                </button>
              </div>

              {/* 遍历渲染所有线路 */}
              {data.directions.map(dir => (
                <div key={dir.id} className="p-5 border border-gray-200 rounded-xl relative bg-gray-50/50">
                  {/* 删除线路按钮 */}
                  <button
                    onClick={() => delLine(dir.id)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500 p-1"
                  >
                    <Trash2 size={18} />
                  </button>

                  <div className="grid gap-5 pr-8">
                    {/* 运营时间说明输入框 */}
                    <div>
                      <label className="block text-sm font-semibold text-black mb-1">运营时间说明</label>
                      <input
                        type="text"
                        value={dir.timeInfo}
                        onChange={e => updateTime(dir.id, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none text-sm font-semibold text-black"
                      />
                    </div>

                    {/* 站点设置区域 */}
                    <div>
                      <label className="block text-sm font-semibold text-black mb-3">站点设置</label>
                      <div className="space-y-2">
                        {/* 遍历渲染所有站点 */}
                        {dir.stations.map((st, idx) => (
                          <div key={st.id} className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 flex items-center gap-2 bg-white px-3 py-2 border border-gray-200 rounded-md">
                                {/* 起点/终点标记（编辑区固定中文） */}
                                {st.type !== 'intermediate' && (
                                  <span className="w-5 h-5 flex items-center justify-center text-xs font-semibold rounded-full bg-[#daf3de] text-green-700 shrink-0">
                                    {st.type === 'start' ? '起' : '终'}
                                  </span>
                                )}
                                {/* 站点名称输入框 */}
                                <input
                                  type="text"
                                  value={st.name}
                                  onChange={e => updateStation(dir.id, st.id, e.target.value)}
                                  className="flex-1 outline-none text-sm font-semibold text-black"
                                  placeholder="输入站点名称"
                                />
                                {/* 删除途经站按钮 */}
                                {st.type === 'intermediate' && (
                                  <button onClick={() => delStation(dir.id, st.id)} className="text-gray-400">
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* 站点之间的添加途经站按钮 */}
                            {idx < dir.stations.length - 1 && (
                              <div className="flex justify-center -my-1">
                                <button
                                  onClick={() => addMiddleStation(dir.id, idx)}
                                  className="bg-white border border-gray-200 rounded-full p-1 text-gray-400 hover:text-green-600"
                                >
                                  <Plus size={14} />
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ========== 右侧预览区（核心展示区域，支持中英文切换）========== */}
        <div className="flex flex-col items-center h-[calc(100vh-4rem)]">
          {/* 预览区标题 + 下载图片按钮 */}
          <div className="w-full flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-black">效果预览</h2>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-lg font-semibold"
            >
              <Download size={18} /> 下载图片
            </button>
          </div>

          {/* 预览卡片容器 */}
          <div className="bg-gray-200 p-8 rounded-2xl w-full flex-1 overflow-auto flex justify-center items-start">
            {/* 实际导出的卡片区域（带 ref） */}
            <div
              ref={previewRef}
              className="bg-white w-[400px] pt-[10px] pl-[10px] pr-8 pb-[10px] shrink-0 relative"
              style={{ fontFamily: "Alibaba PuHuiTi 3.0" }}
            >
              {/* 主标题（带绿色下划线装饰） */}
              <div className="relative inline-block mb-4">
                <h1 className="text-[24px] font-semibold text-black relative z-10 tracking-wide">
                  {view.mainTitle}
                </h1>
                <div className="absolute bottom-1 left-0 w-full h-1.5 bg-[rgba(154,205,168,0.8)] z-0"></div>
              </div>

              {/* 遍历渲染所有线路 */}
              <div className="space-y-6">
                {data.directions.map((dir, i) => {
                  const s = dir.stations.find(x => x.type === 'start');
                  const e = dir.stations.find(x => x.type === 'end');
                  const isLastLine = i === data.directions.length - 1;
                  
                  return (
                    <React.Fragment key={dir.id}>
                      {/* 线路间分隔虚线（撑满宽度） */}
                      {i > 0 && (
                        <div className="border-t border-dashed border-gray-300 my-6 mx-[-10px] mr-[-32px]"></div>
                      )}
                      <div className={isLastLine ? 'pb-0' : ''}>
                        {/* 线路名称（起点 → 终点） */}
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-1.5 h-5 bg-[#9acda8] rounded-sm shrink-0"></div>
                          <h2 className="text-lg font-semibold text-black">
                            {s?.name}
                            <span className="mx-1 text-black font-semibold">→</span>
                            {e?.name}
                          </h2>
                        </div>

                        {/* 运营时间说明（唯一使用 55 Regular 灰色字体） */}
                        <p className="text-[#999] text-[13px] ml-3.5 mb-2 font-normal">
                          {dir.timeInfo}
                        </p>

                        {/* 站点列表 */}
                        <div className="ml-3.5 flex flex-col">
                          {dir.stations.map((st, sIdx) => (
                            <React.Fragment key={st.id}>
                              {/* 单个站点 */}
                              <div className="flex items-center gap-3">
                                {/* 起点/终点标记（英文模式缩小） */}
                                {st.type !== 'intermediate' ? (
                                  <div className={`rounded-full flex items-center justify-center text-xs font-semibold bg-[#daf3de] text-green-700 shrink-0 ${previewLang === 'zh' ? 'w-5 h-5' : 'w-3 h-3'}`}>
                                    {st.type === 'start' ? view.startMark : view.endMark}
                                  </div>
                                ) : (
                                  // 途经站小圆点（核心修改：容器尺寸动态，与起终点对齐）
                                  <div className={`flex items-center justify-center shrink-0 ${previewLang === 'zh' ? 'w-5 h-5' : 'w-3 h-3'}`}>
                                    <div className="w-1.5 h-1.5 bg-[#daf3de] rounded-full"></div>
                                  </div>
                                )}
                                {/* 站点名称 */}
                                <span className="font-semibold text-[15px] text-black">
                                  {st.name}
                                </span>
                              </div>

                              {/* 站点间的虚线（核心修改：宽度与所有标记一致，确保居中对齐） */}
                              {sIdx < dir.stations.length - 1 && (
                                <div className={`flex flex-col items-center gap-1 ${
                                  // 动态宽度：中文与w-5图标对齐，英文与w-3图标对齐
                                  previewLang === 'zh' ? 'w-5' : 'w-3'
                                } ${
                                  // 动态间距：有途经点小间距，无途经点大间距
                                  dir.stations.length > 2 ? 'py-0.5' : 'py-1.5'
                                }`}>
                                  <div className="w-0.5 h-0.5 bg-[#daf3de] rounded-full"></div>
                                  <div className="w-0.5 h-0.5 bg-[#daf3de] rounded-full"></div>
                                  {/* 无途经点时补充更多虚线点 */}
                                  {dir.stations.length <= 2 && (
                                    <>
                                      <div className="w-0.5 h-0.5 bg-[#daf3de] rounded-full"></div>
                                      <div className="w-0.5 h-0.5 bg-[#daf3de] rounded-full"></div>
                                      <div className="w-0.5 h-0.5 bg-[#daf3de] rounded-full"></div>
                                    </>
                                  )}
                                </div>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}