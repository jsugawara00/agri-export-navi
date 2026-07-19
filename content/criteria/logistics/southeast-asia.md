---
freshness: C
source: 一般公開の航路情報をもとに手動整備（定期見直し）
retrieved_at: 2026-07-19
---

## 概要

日本〜シンガポール・マレーシア・タイ方面の東南アジア航路。
台風シーズン（おおむね7〜10月）の遅延リスクと、航海日数が
東アジア向けより長くなる点に留意する。

## 減点項目

- id: typhoon-delay
  points: -3
  label: 台風シーズンの遅延リスクがある航路
  remedy: 出荷時期に余裕を持たせ、乙仲と代替スケジュールを事前に相談する
  step_ref: #logistics-plan
- id: transit-time
  points: -2
  label: 東アジア向けより航海日数が長い
  remedy: 品目の日持ちと輸送日数を乙仲に確認し、必要ならリーファー（定温）輸送を検討する
  step_ref: #logistics-plan
