import React from "react";

const filterValueMap = {
  type: {
    화장실: "LITTERBOX",
    모래: "SAND",
    삽: "SCOOP",
    봉투: "BAG",
  },
  size: {
    소형: "소형",
    중형: "중형",
    대형: "대형",
    가늘음: "가늘음",
    중간: "중간",
    굵음: "굵음",
  },
  material: {
    벤토나이트: "벤토나이트",
    두부: "두부",
    카사바: "카사바",
    크리스탈: "크리스탈",
    우드펠릿: "우드펠릿",
    플라스틱: "플라스틱",
    스테인리스: "스테인리스",
    원목: "원목",
    "PE 비닐": "PE 비닐",
    "생분해 비닐": "생분해 비닐",
  },
  sort: {
    latest: "latest",
    likes: "likes",
    name: "name",
  },
};

const reverseFilterValueMap = {
  type: Object.fromEntries(Object.entries(filterValueMap.type).map(([k, v]) => [v, k])),
  size: Object.fromEntries(Object.entries(filterValueMap.size).map(([k, v]) => [v, k])),
  material: Object.fromEntries(Object.entries(filterValueMap.material).map(([k, v]) => [v, k])),
  sort: Object.fromEntries(Object.entries(filterValueMap.sort).map(([k, v]) => [v, k])),
};

const dynamicOptions = {
  화장실: {
    size: ["", "소형", "중형", "대형"],
    material: ["", "플라스틱", "스테인리스", "원목"],
  },
  모래: {
    size: ["", "소형", "중형", "대형"],
    material: ["", "벤토나이트", "두부", "카사바", "크리스탈", "우드펠릿"],
  },
  삽: {
    size: ["", "소형", "중형", "대형"],
    material: ["", "플라스틱", "스테인리스"],
  },
  봉투: {
    size: ["", "소형", "중형", "대형"],
    material: ["", "PE 비닐", "생분해 비닐"],
  },
};

const initialFilterValues = {
  type: "",
  size: "",
  material: "",
  sort: "latest",
};

const ProductFilterBar = ({ title, filters, onFilterChange, sortOptions }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;

    const updatedFilters =
      name === "type"
        ? { ...filters, type: value, size: "", material: "" } // type 변경 시 size/material 초기화
        : { ...filters, [name]: value };

    triggerFilterUpdate(updatedFilters);
  };

  const handleReset = () => {
    triggerFilterUpdate(initialFilterValues);
  };

  const triggerFilterUpdate = (updatedFilters) => {
    const mappedFilters = {};
    for (const key in updatedFilters) {
      const val = updatedFilters[key];
      mappedFilters[key] = filterValueMap[key]?.[val] || val;
    }
    onFilterChange(updatedFilters, mappedFilters);
  };

  // ✅ type은 코드값이므로 한글 키로 변환해서 옵션 목록 가져옴
  const selectedTypeKey = reverseFilterValueMap.type[filters.type];
  const sizeOptions = selectedTypeKey ? dynamicOptions[selectedTypeKey]?.size || [""] : [""];
  const materialOptions = selectedTypeKey ? dynamicOptions[selectedTypeKey]?.material || [""] : [""];

  return (
    <div className="bg-white border rounded-xl p-6 mb-10 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        {title && <h2 className="text-xl font-bold text-gray-800">{title}</h2>}
        <button
          onClick={handleReset}
          className="text-sm px-3 py-1 border rounded bg-gray-100 hover:bg-gray-200"
        >
          🔄 필터 초기화
        </button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {/* 종류 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">📦 종류</label>
          <select
            name="type"
            onChange={handleChange}
            className="w-full border p-2 rounded"
            value={reverseFilterValueMap.type[filters.type] || ""}
          >
            {["", "화장실", "모래", "삽", "봉투"].map((opt) => (
              <option key={opt} value={opt}>
                {opt || "전체"}
              </option>
            ))}
          </select>
        </div>

        {/* 크기 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">📏 크기</label>
          <select
            name="size"
            onChange={handleChange}
            className="w-full border p-2 rounded"
            value={reverseFilterValueMap.size[filters.size] || ""}
          >
            {sizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt || "전체"}
              </option>
            ))}
          </select>
        </div>

        {/* 재질 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">🌿 재질 / 모래 종류</label>
          <select
            name="material"
            onChange={handleChange}
            className="w-full border p-2 rounded"
            value={reverseFilterValueMap.material[filters.material] || ""}
          >
            {materialOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt || "전체"}
              </option>
            ))}
          </select>
        </div>

        {/* 정렬 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">🔽 정렬 기준</label>
          <select
            name="sort"
            onChange={handleChange}
            className="w-full border p-2 rounded"
            value={reverseFilterValueMap.sort[filters.sort] || ""}
          >
            {sortOptions.map((opt) =>
              typeof opt === "string" ? (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ) : (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              )
            )}
          </select>
        </div>
      </div>
    </div>
  );
};

export default ProductFilterBar;