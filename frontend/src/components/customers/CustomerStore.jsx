import React, { useState, useEffect } from "react";
import styled, { createGlobalStyle, keyframes, css } from "styled-components";
import { sharedProducts, sharedServices } from "../shared/inventorySync";
import inventorySync, { eventEmitter } from "../../services/inventorySync";
import { apiRequest } from "../../api/client";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faHeart,
  faShoppingCart,
  faStore,
  faStar,
  faStarHalfAlt,
  faTimes,
  faPlus,
  faMinus,
  faTrash,
  faCheck,
  faBox,
  faCreditCard,
  faReceipt,
  faEye,
  faFilter,
  faDrumstickBite,
  faCircle,
  faDog,
  faPills,
  faHotel,
  faBoxOpen,
  faHistory,
  faChevronRight,
  faSpinner,
  faCheckCircle,
  faExclamationTriangle,
  faUniversity,
  faMobileAlt,
  faQrcode,
  faPrint,
  faUser,
  faCalendarAlt,
  faHashtag,
  faShieldAlt,
  faCopy,
  faPumpSoap,
} from "@fortawesome/free-solid-svg-icons";

/* ─── Design Tokens ────────────────────────────────────────────── */
const PINK = "#ff5f93";
const PINK_LIGHT = "#ff8db5";
const GLASS_SHD = "0 18px 45px rgba(255,95,147,0.14)";

/* ─── Payment Methods ──────────────────────────────────────────── */
const PAYMENT_METHODS = [
  {
    id: "gcash",
    label: "GCash",
    icon: faMobileAlt,
    description: "Pay via GCash e-wallet",
    accountName: "Pawesome Pet Shop",
    accountNumber: "09XX-XXX-XXXX",
    color: "#007aff",
    qrPlaceholder: "GCash QR",
  },
  {
    id: "paymaya",
    label: "PayMaya",
    icon: faMobileAlt,
    description: "Pay via Maya e-wallet",
    accountName: "Pawesome Pet Shop",
    accountNumber: "09XX-XXX-XXXX",
    color: "#00c851",
    qrPlaceholder: "Maya QR",
  },
  {
    id: "bank_transfer",
    label: "Bank Transfer",
    icon: faUniversity,
    description: "Direct bank transfer / InstaPay / PESONet",
    accountName: "Pawesome Pet Shop",
    accountNumber: "XXXX-XXXX-XXXX",
    bankName: "BDO / BPI / UnionBank",
    color: "#6c63ff",
    qrPlaceholder: null,
  },
  {
    id: "credit_card",
    label: "Credit / Debit Card",
    icon: faCreditCard,
    description: "Visa, Mastercard, JCB accepted",
    accountName: null,
    accountNumber: null,
    color: "#ff5f93",
    qrPlaceholder: null,
  },
];

/* ─── Global Styles ────────────────────────────────────────────── */
const GlobalStyle = createGlobalStyle`
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', system-ui, -apple-system, sans-serif; }

  .customer-store-dark {
    --store-glass-bg: rgba(255,255,255,0.06);
    --store-glass-bdr: rgba(255,141,181,0.22);
    --store-text: #f8fafc;
    --store-muted: #cbd5e1;
    --store-heading: #f8fafc;
    --store-surface: rgba(255,255,255,0.06);
  }

  .customer-store:not(.dark) {
    --store-glass-bg: rgba(255,255,255,0.82);
    --store-glass-bdr: rgba(255,95,147,0.18);
    --store-text: #1f2937;
    --store-muted: #64748b;
    --store-heading: #191919;
    --store-surface: rgba(255,255,255,0.62);
  }
`;

/* ─── Animations ───────────────────────────────────────────────── */
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: none; }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: none; }
`;

const popIn = keyframes`
  from { opacity: 0; transform: scale(.92); }
  to { opacity: 1; transform: scale(1); }
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

// pulse removed - unused animation

/* ─── Styled Components ────────────────────────────────────────── */
const StorePage = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #fdf0f4;
  overflow-x: hidden;
`;

const StoreHeader = styled.header`
  background: var(--store-glass-bg, rgba(255,255,255,0.82));
  border-bottom: 1px solid var(--store-glass-bdr, rgba(255,95,147,0.18));
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  padding: 20px 24px;
  box-shadow: 0 4px 20px rgba(255,95,147,0.1);
  position: sticky;
  top: 0;
  z-index: 100;
`;

const HeaderInner = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
`;

const HeaderTitle = styled.h1`
  font-size: 28px;
  font-weight: 950;
  color: var(--store-heading, #191919);
  letter-spacing: -0.8px;
  display: flex;
  align-items: center;
  gap: 10px;

  svg {
    color: ${PINK};
  }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  justify-content: flex-end;
  flex-wrap: wrap;
`;

const SearchBar = styled.div`
  position: relative;
  width: 100%;
  max-width: 400px;

  svg {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: ${PINK};
    font-size: 14px;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  height: 44px;
  border-radius: 999px;
  border: 1px solid var(--store-glass-bdr, rgba(255,95,147,0.18));
  background: rgba(255,255,255,0.72);
  padding: 0 16px 0 42px;
  font-size: 13px;
  color: var(--store-text, #1f2937);
  outline: none;
  transition: all 0.2s;

  &:focus {
    border-color: rgba(255,95,147,0.55);
    box-shadow: 0 0 0 4px rgba(255,95,147,0.12);
  }

  &::placeholder {
    color: #94a3b8;
  }
`;

const WishlistBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 44px;
  padding: 0 18px;
  border-radius: 999px;
  border: 1px solid var(--store-glass-bdr, rgba(255,95,147,0.18));
  background: var(--store-glass-bg, rgba(255,255,255,0.82));
  color: var(--store-text, #1f2937);
  font-size: 13px;
  font-weight: 900;
  cursor: pointer;
  transition: all 0.2s;
  backdrop-filter: blur(8px);
  white-space: nowrap;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(255,95,147,0.18);
  }

  svg {
    color: ${PINK};
  }
`;

const WishlistBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 999px;
  background: ${PINK};
  color: #fff;
  font-size: 10px;
  font-weight: 900;
`;

const StoreContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
  width: 100%;
  display: grid;
  grid-template-columns: 260px 1fr 340px;
  gap: 20px;
  align-items: start;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }

  @media (max-width: 640px) {
    padding: 14px;
  }
`;

const Sidebar = styled.aside`
  background: var(--store-glass-bg, rgba(255,255,255,0.82));
  border: 1px solid var(--store-glass-bdr, rgba(255,95,147,0.18));
  border-radius: 28px;
  padding: 20px;
  backdrop-filter: blur(18px);
  box-shadow: ${GLASS_SHD};
  position: sticky;
  top: 100px;

  @media (max-width: 1200px) {
    position: static;
  }
`;

const SidebarSection = styled.div`
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SidebarTitle = styled.h3`
  font-size: 14px;
  font-weight: 950;
  color: var(--store-heading, #191919);
  margin-bottom: 12px;
  letter-spacing: -0.3px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CategoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const CategoryBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 14px;
  border-radius: 16px;
  border: 1px solid ${({ $active }) => ($active ? "rgba(255,95,147,0.35)" : "rgba(255,95,147,0.12)")};
  background: ${({ $active }) => ($active ? "rgba(255,95,147,0.1)" : "rgba(255,255,255,0.62)")};
  color: ${({ $active }) => ($active ? PINK : "var(--store-text, #1f2937)")};
  font-size: 13px;
  font-weight: ${({ $active }) => ($active ? 900 : 700)};
  cursor: pointer;
  text-align: left;
  transition: all 0.18s;

  &:hover {
    transform: translateY(-1px);
    background: rgba(255,95,147,0.1);
    border-color: rgba(255,95,147,0.35);
  }

  svg {
    font-size: 14px;
    flex-shrink: 0;
  }
`;

const FilterInput = styled.input`
  width: 100%;
  height: 38px;
  border-radius: 12px;
  border: 1px solid rgba(255,95,147,0.16);
  background: rgba(255,255,255,0.8);
  padding: 0 12px;
  font-size: 13px;
  color: var(--store-text, #1f2937);
  outline: none;
  transition: all 0.2s;

  &:focus {
    border-color: rgba(255,95,147,0.45);
    box-shadow: 0 0 0 3px rgba(255,95,147,0.1);
  }
`;

const FilterSelect = styled.select`
  width: 100%;
  height: 38px;
  border-radius: 12px;
  border: 1px solid rgba(255,95,147,0.16);
  background: rgba(255,255,255,0.8);
  padding: 0 12px;
  font-size: 13px;
  color: var(--store-text, #1f2937);
  font-weight: 600;
  outline: none;
  cursor: pointer;
  transition: all 0.2s;

  &:focus {
    border-color: rgba(255,95,147,0.45);
  }
`;

const PriceRange = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 8px;
  align-items: center;
  margin-top: 8px;

  span {
    color: var(--store-muted, #64748b);
    font-size: 12px;
  }
`;

const OrderHistoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 10px;
`;

const HistoryItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px;
  border-radius: 12px;
  background: rgba(255,95,147,0.06);
  border: 1px solid rgba(255,95,147,0.1);

  .order-id {
    font-size: 11px;
    font-weight: 900;
    color: var(--store-text, #1f2937);
    word-break: break-word;
  }

  .order-amount {
    font-size: 14px;
    font-weight: 950;
    color: ${PINK};
  }

  .order-status {
    display: inline-flex;
    width: fit-content;
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 10px;
    font-weight: 900;
    text-transform: capitalize;
    background: ${({ $status }) =>
      $status === "completed"
        ? "rgba(34,197,94,0.12)"
        : $status === "processing" || $status === "approved"
        ? "rgba(251,146,60,0.14)"
        : "rgba(100,116,139,0.1)"};
    color: ${({ $status }) =>
      $status === "completed"
        ? "#15803d"
        : $status === "processing" || $status === "approved"
        ? "#ea580c"
        : "#64748b"};
  }
`;

const MainArea = styled.main`
  min-height: 600px;
`;

const CategoryHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255,95,147,0.12);
  gap: 1rem;
  flex-wrap: wrap;
`;

const CategoryTitle = styled.h2`
  font-size: 26px;
  font-weight: 950;
  color: var(--store-heading, #191919);
  letter-spacing: -0.8px;
`;

const ProductCount = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(255,95,147,0.1);
  color: ${PINK};
  font-size: 12px;
  font-weight: 900;
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
  animation: ${fadeIn} 0.3s ease;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const ProductCard = styled.div`
  background: rgba(255,255,255,0.72);
  border: 1px solid rgba(255,95,147,0.14);
  border-radius: 24px;
  padding: 16px;
  position: relative;
  transition: all 0.2s;
  animation: ${fadeIn} 0.25s ease both;
  box-shadow: 0 8px 24px rgba(255,95,147,0.06);
  display: flex;
  flex-direction: column;
  gap: 12px;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 18px 36px rgba(255,95,147,0.16);
    border-color: rgba(255,95,147,0.35);
  }
`;

const ProductImage = styled.div`
  height: 140px;
  border-radius: 18px;
  background: linear-gradient(135deg, #ffc8dd, #fff1f7);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  position: relative;
  overflow: hidden;
  margin-bottom: 8px;
`;

const ProductBadge = styled.span`
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 900;

  ${({ $type }) =>
    $type === "discount" &&
    css`
      background: #ef4444;
      color: #fff;
    `}

  ${({ $type }) =>
    $type === "low" &&
    css`
      background: rgba(251,146,60,0.9);
      color: #fff;
    `}

  ${({ $type }) =>
    $type === "out" &&
    css`
      background: rgba(239,68,68,0.9);
      color: #fff;
    `}
`;

const ProductInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const ProductName = styled.h3`
  font-size: 14px;
  font-weight: 950;
  color: var(--store-heading, #191919);
  line-height: 1.3;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ProductRating = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #f59e0b;

  .reviews {
    color: var(--store-muted, #64748b);
    margin-left: 4px;
  }
`;

const ProductPrice = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;

  .original {
    font-size: 12px;
    color: #94a3b8;
    text-decoration: line-through;
  }

  .current,
  .discounted {
    font-size: 18px;
    font-weight: 950;
    color: ${PINK};
  }
`;

const ProductActions = styled.div`
  display: flex;
  gap: 6px;
  margin-top: auto;
`;

const ProductBtn = styled.button`
  flex: 1;
  height: 38px;
  border-radius: 12px;
  border: none;
  font-size: 12px;
  font-weight: 900;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  ${({ $variant }) =>
    $variant === "primary" &&
    css`
      background: linear-gradient(135deg, ${PINK}, ${PINK_LIGHT});
      color: #fff;
      box-shadow: 0 8px 18px rgba(255,95,147,0.22);

      &:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 12px 24px rgba(255,95,147,0.28);
      }

      &:disabled {
        background: #cbd5e1;
        cursor: not-allowed;
        box-shadow: none;
      }
    `}

  ${({ $variant }) =>
    $variant === "secondary" &&
    css`
      background: rgba(255,95,147,0.1);
      color: ${PINK};
      border: 1px solid rgba(255,95,147,0.2);

      &:hover {
        background: rgba(255,95,147,0.18);
      }
    `}

  ${({ $variant, $active }) =>
    $variant === "icon" &&
    css`
      flex: 0 0 38px;
      background: ${$active ? PINK : "rgba(255,95,147,0.08)"};
      color: ${$active ? "#fff" : PINK};

      &:hover {
        background: ${$active ? PINK : "rgba(255,95,147,0.16)"};
      }
    `}
`;

const CartPanel = styled.aside`
  background: var(--store-glass-bg, rgba(255,255,255,0.82));
  border: 1px solid var(--store-glass-bdr, rgba(255,95,147,0.18));
  border-radius: 28px;
  padding: 20px;
  backdrop-filter: blur(18px);
  box-shadow: ${GLASS_SHD};
  position: sticky;
  top: 100px;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media (max-width: 1200px) {
    position: static;
    max-height: none;
  }

  &::-webkit-scrollbar {
    width: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255,95,147,0.2);
    border-radius: 4px;
  }
`;

const CartTitle = styled.h2`
  font-size: 18px;
  font-weight: 950;
  color: var(--store-heading, #191919);
  letter-spacing: -0.4px;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CartItems = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const CartItem = styled.div`
  display: flex;
  gap: 10px;
  padding: 12px;
  border-radius: 16px;
  background: rgba(255,255,255,0.62);
  border: 1px solid rgba(255,95,147,0.12);
  animation: ${slideIn} 0.2s ease both;
`;

const CartItemImage = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #ffc8dd, #fff1f7);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
`;

const CartItemInfo = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;

  .name {
    font-size: 13px;
    font-weight: 950;
    color: var(--store-heading, #191919);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .price {
    font-size: 12px;
    font-weight: 900;
    color: ${PINK};
  }
`;

const QtyControls = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  border-radius: 999px;
  background: rgba(255,95,147,0.08);
  padding: 3px;

  button {
    width: 24px;
    height: 24px;
    border-radius: 999px;
    border: none;
    background: #fff;
    color: ${PINK};
    font-size: 11px;
    font-weight: 950;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.1s;

    &:hover:not(:disabled) {
      background: ${PINK};
      color: #fff;
    }

    &:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }
  }

  span {
    width: 28px;
    text-align: center;
    font-size: 12px;
    font-weight: 950;
    color: var(--store-heading, #191919);
  }
`;

const RemoveBtn = styled.button`
  width: 24px;
  height: 24px;
  border-radius: 999px;
  border: none;
  background: transparent;
  color: #94a3b8;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.15s;

  &:hover {
    background: rgba(239,68,68,0.1);
    color: #dc2626;
  }
`;

const EmptyCart = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px 20px;
  text-align: center;

  svg {
    font-size: 40px;
    color: rgba(255,95,147,0.3);
  }

  p {
    font-size: 13px;
    color: var(--store-muted, #64748b);
  }
`;

const DiscountSection = styled.div`
  display: flex;
  gap: 6px;

  input {
    flex: 1;
    height: 38px;
    border-radius: 12px;
    border: 1px solid rgba(255,95,147,0.16);
    background: rgba(255,255,255,0.8);
    padding: 0 12px;
    font-size: 12px;
    color: #1f2937;
    outline: none;

    &:focus {
      border-color: rgba(255,95,147,0.45);
    }
  }

  button {
    height: 38px;
    padding: 0 16px;
    border-radius: 12px;
    border: none;
    background: linear-gradient(135deg, ${PINK}, ${PINK_LIGHT});
    color: #fff;
    font-size: 12px;
    font-weight: 900;
    cursor: pointer;
    white-space: nowrap;

    &:hover {
      transform: translateY(-1px);
    }
  }
`;

const DiscountApplied = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 12px;
  background: rgba(34,197,94,0.09);
  color: #16a34a;
  font-size: 12px;
  font-weight: 900;

  svg {
    font-size: 14px;
  }
`;

const CartSummary = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px dashed rgba(255,95,147,0.2);
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: ${({ $type }) => ($type === "total" ? "var(--store-heading, #191919)" : "var(--store-muted, #64748b)")};
  font-weight: ${({ $type }) => ($type === "total" ? 950 : 400)};

  ${({ $type }) =>
    $type === "total" &&
    css`
      font-size: 16px;
      padding-top: 8px;
      margin-top: 4px;
      border-top: 1px solid rgba(255,95,147,0.2);

      span:last-child {
        color: ${PINK};
        font-size: 20px;
      }
    `}

  ${({ $type }) =>
    $type === "discount" &&
    css`
      color: #16a34a;
    `}
`;

const CheckoutBtn = styled.button`
  width: 100%;
  height: 48px;
  border-radius: 16px;
  border: none;
  background: ${({ disabled }) => (disabled ? "#cbd5e1" : `linear-gradient(135deg, ${PINK}, ${PINK_LIGHT})`)};
  color: ${({ disabled }) => (disabled ? "#94a3b8" : "#fff")};
  font-size: 14px;
  font-weight: 950;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  transition: all 0.2s;
  box-shadow: ${({ disabled }) => (disabled ? "none" : "0 12px 24px rgba(255,95,147,0.22)")};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 16px 32px rgba(255,95,147,0.3);
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15,23,42,0.48);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
  animation: ${fadeIn} 0.15s ease;
`;

const Modal = styled.div`
  background: rgba(255,255,255,0.98);
  border: 1px solid rgba(255,95,147,0.2);
  border-radius: 28px;
  width: 100%;
  max-width: ${({ $width }) => $width || "560px"};
  max-height: 92vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: ${popIn} 0.2s ease;
  box-shadow: 0 30px 80px rgba(15,23,42,0.28);
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22px 24px;
  border-bottom: 1px solid rgba(255,95,147,0.12);

  h2 {
    font-size: 18px;
    font-weight: 950;
    color: #191919;
    margin: 0;
    letter-spacing: -0.4px;
  }
`;

const CloseBtn = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 999px;
  border: none;
  background: rgba(239,68,68,0.1);
  color: #dc2626;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;

  &:hover {
    background: rgba(239,68,68,0.2);
  }
`;

const ModalBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;

  &::-webkit-scrollbar {
    width: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255,95,147,0.2);
    border-radius: 4px;
  }
`;

const OrderSummaryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px;
  border-radius: 16px;
  background: rgba(255,95,147,0.04);
  border: 1px solid rgba(255,95,147,0.1);
  margin-bottom: 4px;
`;

const SummaryItem = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #374151;
  gap: 0.75rem;

  span:first-child {
    font-weight: 600;
  }

  span:last-child {
    font-weight: 900;
    color: ${PINK};
    white-space: nowrap;
  }
`;

const PaymentMethodGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const PaymentMethodCard = styled.button`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  padding: 14px;
  border-radius: 16px;
  border: 2px solid ${({ $active, $color }) => ($active ? $color || PINK : "rgba(255,95,147,0.14)")};
  background: ${({ $active, $color }) => ($active ? `${$color}12` : "rgba(255,255,255,0.62)")};
  cursor: pointer;
  text-align: left;
  transition: all 0.18s;
  position: relative;

  &:hover {
    border-color: ${({ $color }) => $color || PINK};
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(0,0,0,0.08);
  }

  .pm-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: ${({ $color }) => $color || PINK}18;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${({ $color }) => $color || PINK};
    font-size: 16px;
  }

  .pm-label {
    font-size: 13px;
    font-weight: 900;
    color: #191919;
  }

  .pm-desc {
    font-size: 11px;
    color: #64748b;
    font-weight: 500;
    line-height: 1.3;
  }

  .pm-check {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 20px;
    height: 20px;
    border-radius: 999px;
    background: ${({ $color }) => $color || PINK};
    color: #fff;
    display: ${({ $active }) => ($active ? "flex" : "none")};
    align-items: center;
    justify-content: center;
    font-size: 10px;
  }
`;

const PaymentDetailsBox = styled.div`
  border-radius: 16px;
  border: 1px solid rgba(255,95,147,0.16);
  background: rgba(255,255,255,0.8);
  overflow: hidden;
`;

const PaymentDetailsHeader = styled.div`
  padding: 12px 16px;
  background: ${({ $color }) => $color || PINK}14;
  border-bottom: 1px solid ${({ $color }) => $color || PINK}22;
  font-size: 12px;
  font-weight: 900;
  color: ${({ $color }) => $color || PINK};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PaymentDetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  border-bottom: 1px solid rgba(255,95,147,0.08);

  &:last-child {
    border-bottom: none;
  }

  .pd-label {
    font-size: 12px;
    color: #64748b;
    font-weight: 600;
  }

  .pd-value {
    font-size: 13px;
    font-weight: 950;
    color: #191919;
    display: flex;
    align-items: center;
    gap: 8px;
    text-align: right;
  }
`;

const CopyBtn = styled.button`
  width: 26px;
  height: 26px;
  border-radius: 8px;
  border: none;
  background: rgba(255,95,147,0.1);
  color: ${PINK};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  transition: all 0.15s;

  &:hover {
    background: rgba(255,95,147,0.2);
  }
`;

const QRCodePlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 24px;
  background: #f8fafc;
  border-radius: 16px;
  border: 2px dashed rgba(255,95,147,0.2);
  margin-bottom: 12px;

  svg {
    font-size: 48px;
    color: rgba(255,95,147,0.3);
  }

  p {
    font-size: 12px;
    color: #94a3b8;
    font-weight: 600;
    text-align: center;
  }

  .qr-label {
    font-size: 14px;
    font-weight: 900;
    color: #191919;
  }
`;

// FileUploadWrapper and UploadedFile removed - payment proof upload moved to CustomerPayments

const BackBtn = styled.button`
  flex: 1;
  height: 46px;
  border-radius: 16px;
  border: 1px solid rgba(100,116,139,0.2);
  background: rgba(100,116,139,0.08);
  color: #475569;
  font-size: 14px;
  font-weight: 900;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    background: rgba(100,116,139,0.14);
  }
`;

const ConfirmBtn = styled.button`
  flex: 2;
  height: 46px;
  border-radius: 16px;
  border: none;
  background: ${({ disabled }) => (disabled ? "#cbd5e1" : `linear-gradient(135deg, ${PINK}, ${PINK_LIGHT})`)};
  color: ${({ disabled }) => (disabled ? "#94a3b8" : "#fff")};
  font-size: 14px;
  font-weight: 950;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  transition: all 0.2s;
  box-shadow: ${({ disabled }) => (disabled ? "none" : "0 10px 22px rgba(255,95,147,0.22)")};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 14px 28px rgba(255,95,147,0.3);
  }
`;

const SpinnerIcon = styled(FontAwesomeIcon)`
  animation: ${spin} 0.8s linear infinite;
`;

const ReceiptPaper = styled.div`
  background: #fff;
  border: 1px solid rgba(255,95,147,0.15);
  border-radius: 20px;
  overflow: hidden;
  font-family: 'Courier New', monospace;
  box-shadow: 0 8px 24px rgba(0,0,0,0.06);
`;

const ReceiptHeader = styled.div`
  background: linear-gradient(135deg, ${PINK}, ${PINK_LIGHT});
  padding: 20px;
  text-align: center;
  color: #fff;

  h3 {
    font-size: 18px;
    font-weight: 950;
    margin: 0 0 4px;
    letter-spacing: 1px;
  }

  p {
    font-size: 11px;
    opacity: 0.85;
    margin: 0;
  }
`;

const ReceiptBody = styled.div`
  padding: 18px 20px;
`;

const ReceiptInfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 16px;
`;

const ReceiptInfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;

  .ri-label {
    font-size: 10px;
    font-weight: 600;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .ri-value {
    font-size: 13px;
    font-weight: 950;
    color: #191919;
  }
`;

const ReceiptDivider = styled.div`
  border-top: 1px dashed rgba(100,116,139,0.3);
  margin: 12px 0;
`;

const ReceiptItemsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
`;

const ReceiptLineItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  font-size: 12px;
  gap: 8px;

  .ri-name {
    color: #374151;
    font-weight: 600;
    flex: 1;
  }

  .ri-qty {
    color: #64748b;
    font-weight: 500;
    white-space: nowrap;
  }

  .ri-price {
    font-weight: 950;
    color: #191919;
    white-space: nowrap;
  }
`;

const ReceiptTotals = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const ReceiptTotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: ${({ $grand }) => ($grand ? "16px" : "12px")};
  font-weight: ${({ $grand }) => ($grand ? 950 : 600)};
  color: ${({ $grand, $discount }) => ($grand ? "#191919" : $discount ? "#16a34a" : "#64748b")};

  ${({ $grand }) =>
    $grand &&
    css`
      padding-top: 10px;
      border-top: 2px solid rgba(255,95,147,0.2);

      span:last-child {
        color: ${PINK};
        font-size: 20px;
      }
    `}
`;

const ReceiptFooter = styled.div`
  background: rgba(255,95,147,0.04);
  border-top: 1px dashed rgba(255,95,147,0.15);
  padding: 14px 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 6px;

  .rf-status {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    justify-content: center;
    font-size: 12px;
    font-weight: 900;
    color: #ea580c;

    svg {
      font-size: 14px;
    }
  }

  .rf-note {
    font-size: 11px;
    color: #94a3b8;
  }

  .rf-thank {
    font-size: 13px;
    font-weight: 950;
    color: ${PINK};
  }
`;

const ReceiptActionBtn = styled.button`
  flex: 1;
  height: 44px;
  border-radius: 14px;
  border: none;
  font-size: 13px;
  font-weight: 900;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;

  ${({ $primary }) =>
    $primary
      ? css`
          background: linear-gradient(135deg, ${PINK}, ${PINK_LIGHT});
          color: #fff;
          box-shadow: 0 8px 18px rgba(255,95,147,0.22);

          &:hover {
            transform: translateY(-1px);
          }
        `
      : css`
          background: rgba(100,116,139,0.1);
          color: #475569;

          &:hover {
            background: rgba(100,116,139,0.16);
          }
        `}
`;

const QuickViewContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const QuickViewImage = styled.div`
  width: 100%;
  aspect-ratio: 1;
  border-radius: 20px;
  background: linear-gradient(135deg, #ffc8dd, #fff1f7);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 80px;
`;

const QuickViewDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;

  .qv-name {
    font-size: 20px;
    font-weight: 950;
    color: #191919;
  }

  .qv-price {
    font-size: 26px;
    font-weight: 950;
    color: ${PINK};
  }

  .qv-rating {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    color: #f59e0b;

    span {
      color: #64748b;
      font-size: 12px;
    }
  }

  .qv-sku {
    font-size: 12px;
    color: #94a3b8;
    font-family: monospace;
  }

  .qv-stock {
    display: inline-block;
    padding: 6px 12px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 900;
    width: fit-content;

    &.in-stock {
      background: rgba(34,197,94,0.12);
      color: #15803d;
    }

    &.out-of-stock {
      background: rgba(239,68,68,0.1);
      color: #dc2626;
    }
  }

  .qv-description {
    font-size: 13px;
    color: #64748b;
    line-height: 1.6;
  }
`;

const QuickViewActions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: auto;
`;

const WishlistGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
  animation: ${fadeIn} 0.3s ease;
`;

const WishlistCard = styled.div`
  background: rgba(255,255,255,0.72);
  border: 1px solid rgba(255,95,147,0.14);
  border-radius: 24px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 8px 24px rgba(255,95,147,0.06);
  animation: ${fadeIn} 0.25s ease both;
`;

const WishlistImage = styled.div`
  height: 120px;
  border-radius: 18px;
  background: linear-gradient(135deg, #ffc8dd, #fff1f7);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
`;

const WishlistInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  h4 {
    font-size: 14px;
    font-weight: 950;
    color: #191919;
    margin: 0;
  }

  p {
    font-size: 16px;
    font-weight: 950;
    color: ${PINK};
    margin: 0;
  }
`;

const WishlistActions = styled.div`
  display: flex;
  gap: 8px;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 60px 20px;
  text-align: center;
  min-height: 400px;

  svg {
    font-size: 64px;
    color: rgba(255,95,147,0.2);
  }

  h3 {
    font-size: 18px;
    font-weight: 950;
    color: #191919;
    margin: 0;
  }

  p {
    font-size: 14px;
    color: #64748b;
    margin: 0;
  }

  button {
    margin-top: 8px;
    height: 42px;
    padding: 0 24px;
    border-radius: 999px;
    border: none;
    background: linear-gradient(135deg, ${PINK}, ${PINK_LIGHT});
    color: #fff;
    font-size: 13px;
    font-weight: 900;
    cursor: pointer;

    &:hover {
      transform: translateY(-1px);
    }
  }
`;

/* ─── Helpers ──────────────────────────────────────────────────── */
const generateOrderId = () =>
  "PAW-" +
  Date.now().toString(36).toUpperCase() +
  "-" +
  Math.random().toString(36).substr(2, 4).toUpperCase();

const generateRefNumber = () =>
  Math.random().toString(36).substr(2, 12).toUpperCase();

const getProductEmoji = (productName) => {
  const name = (productName || "").toLowerCase();

  if (name.includes("food") || name.includes("treat") || name.includes("bone")) return "🦴";
  if (name.includes("toy") || name.includes("ball") || name.includes("chew")) return "⚽";
  if (name.includes("collar") || name.includes("leash")) return "🦮";
  if (name.includes("bed") || name.includes("house")) return "🏠";
  if (name.includes("shampoo") || name.includes("groom")) return "🧴";
  if (name.includes("brush") || name.includes("comb")) return "🪮";
  if (name.includes("vitamin") || name.includes("medicine") || name.includes("health")) return "💊";
  if (name.includes("service") || name.includes("grooming")) return "✂️";
  if (name.includes("boarding") || name.includes("hotel")) return "🏨";

  return "🐾";
};

const categorizeProducts = (products) => {
  const categories = {
    Food: [],
    Accessories: [],
    Grooming: [],
    Toys: [],
    Health: [],
    Services: [],
  };

  (products || []).forEach((product) => {
    const item = {
      id: product.id,
      name: product.name,
      price: Number(product.price || product.unit_price || 0),
      image: getProductEmoji(product.name),
      rating: 4.5,
      reviews: Math.floor(Math.random() * 200) + 50,
      inStock: product.inStock || product.stock > 0 || product.quantity > 0,
      stock: Number(product.stock || product.quantity || 0),
      discount: Number(product.discount || 0),
      sku: product.sku,
      description: product.description,
    };

    const cat = (product.category || "").toLowerCase();

    if (cat.includes("food") || cat.includes("treat")) categories.Food.push(item);
    else if (cat.includes("accessory") || cat.includes("collar") || cat.includes("bed")) categories.Accessories.push(item);
    else if (cat.includes("groom") || cat.includes("shampoo") || cat.includes("brush")) categories.Grooming.push(item);
    else if (cat.includes("toy") || cat.includes("ball") || cat.includes("chew")) categories.Toys.push(item);
    else if (cat.includes("health") || cat.includes("vitamin") || cat.includes("medical")) categories.Health.push(item);
    else if (cat.includes("service") || cat.includes("boarding")) categories.Services.push(item);
    else categories.Food.push(item);
  });

  return categories;
};

const getCategoryIcon = (cat) => {
  const icons = {
    Food: faDrumstickBite,
    Accessories: faDog,
    Grooming: faPumpSoap,
    Toys: faCircle,
    Health: faPills,
    Services: faHotel,
  };

  return icons[cat] || faBox;
};

const renderStars = (rating) =>
  [1, 2, 3, 4, 5].map((i) => (
    <FontAwesomeIcon
      key={i}
      icon={i <= rating ? faStar : i - 0.5 <= rating ? faStarHalfAlt : faStar}
      style={i > rating && i - 0.5 > rating ? { opacity: 0.2 } : {}}
    />
  ));

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text).then(() => {
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "Copied!",
      timer: 1500,
      showConfirmButton: false,
    });
  });
};

const storeData = categorizeProducts([...(sharedProducts || []), ...(sharedServices || [])]);

export default function CustomerStore() {
  const [category, setCategory] = useState("Food");
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 2000 });
  const [sortBy, setSortBy] = useState("name");
  const [checkoutStep, setCheckoutStep] = useState("cart");
  const [paymentMethod, setPaymentMethod] = useState("gcash");
  const [discountCode, setDiscountCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showQuickView, setShowQuickView] = useState(false);
  const [orderHistory, setOrderHistory] = useState([]);
  const [lastOrder, setLastOrder] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [apiProducts, setApiProducts] = useState({});
  const [customerName, setCustomerName] = useState("");

  const safeArray = (value) => {
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.data)) return value.data;
    if (Array.isArray(value?.data?.data)) return value.data.data;
    if (Array.isArray(value?.orders)) return value.orders;
    if (Array.isArray(value?.records)) return value.records;
    return [];
  };

  const getStoredToken = () =>
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("customerToken");

  const getStoredRole = () =>
    String(localStorage.getItem("role") || "").toLowerCase();

  const getOrderAmount = (order) =>
    Number(order?.total_amount || order?.total || order?.totalAmount || 0);

  const getOrderId = (order) =>
    order?.order_number || order?.orderId || order?.order_id || order?.id || "Order";

  const normalizeOrderStatus = (status) =>
    String(status || "pending").toLowerCase().replace(/\s+/g, "_");

  useEffect(() => {
    const unsubscribe = inventorySync.subscribe("CustomerStore", (products) => {
      setApiProducts(products || {});
    });

    const handleStockChange = (stockChanges) => {
      setCart((prevCart) =>
        prevCart
          .map((item) => {
            const stockChange = stockChanges.find((change) => change.id === item.id);

            if (stockChange) {
              const nextStock = Number(stockChange.newStock || 0);

              return {
                ...item,
                stock: nextStock,
                inStock: nextStock > 0,
                qty: Math.min(item.qty, nextStock),
              };
            }

            return item;
          })
          .filter((item) => item.qty > 0)
      );
    };

    eventEmitter.on("stockChanged", handleStockChange);

    inventorySync.getProducts().then((products) => {
      setApiProducts(products || {});
    });

    return () => {
      unsubscribe();
      eventEmitter.off("stockChanged", handleStockChange);
    };
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = getStoredToken();
        const role = getStoredRole();

        if (!token || role !== "customer") {
          setOrderHistory([]);
          return;
        }

        const data = await apiRequest("/customer/store/orders");
        setOrderHistory(safeArray(data));
      } catch (error) {
        console.error("Failed to fetch customer orders:", error);
        setOrderHistory([]);
      }
    };

    fetchOrders();
  }, [checkoutStep]);

  useEffect(() => {
    localStorage.setItem("customer_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("customer_wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("customer_cart") || "[]");
    const savedWishlist = JSON.parse(localStorage.getItem("customer_wishlist") || "[]");
    const savedCustomerName =
      localStorage.getItem("customer_name") ||
      localStorage.getItem("name") ||
      "";

    setCart(savedCart);
    setWishlist(savedWishlist);
    setCustomerName(savedCustomerName);
  }, []);

  useEffect(() => {
    if (customerName) localStorage.setItem("customer_name", customerName);
  }, [customerName]);

  const currentStoreData = Object.keys(apiProducts).length > 0 ? apiProducts : storeData;

  const filteredProducts =
    category === "Wishlist"
      ? []
      : (currentStoreData[category] || [])
          .filter(
            (p) =>
              p &&
              p.name &&
              p.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
              Number(p.price || 0) >= priceRange.min &&
              Number(p.price || 0) <= priceRange.max
          )
          .sort((a, b) => {
            if (sortBy === "name") return (a.name || "").localeCompare(b.name || "");
            if (sortBy === "price-low") return Number(a.price || 0) - Number(b.price || 0);
            if (sortBy === "price-high") return Number(b.price || 0) - Number(a.price || 0);
            if (sortBy === "rating") return Number(b.rating || 0) - Number(a.rating || 0);
            return 0;
          });

  const addToCart = (item) => {
    if (!item.inStock || item.stock <= 0) {
      Swal.fire({
        icon: "warning",
        title: "Out of Stock",
        text: "This product is currently unavailable.",
        confirmButtonColor: PINK,
      });
      return;
    }

    const existing = cart.find((c) => c.id === item.id);

    if (existing) {
      if (existing.qty >= item.stock) {
        Swal.fire({
          icon: "warning",
          title: "Stock limit reached",
          text: `Only ${item.stock} available.`,
          confirmButtonColor: PINK,
        });
        return;
      }

      setCart(cart.map((c) => (c.id === item.id ? { ...c, qty: c.qty + 1 } : c)));
    } else {
      setCart([...cart, { ...item, qty: 1 }]);
    }
  };

  const updateQty = (id, change) => {
    setCart((prev) =>
      prev
        .map((c) => {
          if (c.id !== id) return c;

          const nextQty = c.qty + change;

          if (nextQty > c.stock) {
            Swal.fire({
              icon: "warning",
              title: "Stock limit reached",
              text: `Only ${c.stock} available.`,
              confirmButtonColor: PINK,
            });
            return c;
          }

          return { ...c, qty: Math.max(0, nextQty) };
        })
        .filter((c) => c.qty > 0)
    );
  };

  const removeFromCart = (id) => setCart(cart.filter((item) => item.id !== id));

  const toggleWishlist = (item) => {
    setWishlist(
      wishlist.find((w) => w.id === item.id)
        ? wishlist.filter((w) => w.id !== item.id)
        : [...wishlist, item]
    );
  };

  const getItemPrice = (item) => {
    const price = Number(item?.price || 0);
    const discount = Number(item?.discount || 0);
    return discount > 0 ? price * (1 - discount / 100) : price;
  };

  const getSubtotal = () =>
    cart.reduce((total, item) => total + getItemPrice(item) * Number(item.qty || 1), 0);

  const getDiscountAmount = () =>
    Math.round(getSubtotal() * (Number(discountApplied || 0) / 100));

  const getTotal = () => Math.max(0, getSubtotal() - getDiscountAmount());

  const applyDiscount = () => {
    const codes = { pawesome10: 10, pet20: 20, paw15: 15 };
    const pct = codes[discountCode.toLowerCase()];

    if (pct) {
      setDiscountApplied(pct);
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: `${pct}% discount applied!`,
        timer: 2000,
        showConfirmButton: false,
      });
    } else {
      setDiscountApplied(0);
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "Invalid code",
        timer: 2000,
        showConfirmButton: false,
      });
    }
  };

  const proceedCheckout = () => {
    if (!cart.length) return;

    const invalidItem = cart.find((item) => !item.inStock || item.qty > item.stock);

    if (invalidItem) {
      Swal.fire({
        icon: "warning",
        title: "Stock Issue",
        text: `${invalidItem.name} has insufficient stock. Please adjust your cart.`,
        confirmButtonColor: PINK,
      });
      return;
    }

    setCheckoutStep("payment");
  };

  const selectedPaymentMethod = PAYMENT_METHODS.find((m) => m.id === paymentMethod);

  const confirmPayment = async () => {
    const token = getStoredToken();
    const role = getStoredRole();

    if (!token) {
      Swal.fire({
        icon: "warning",
        title: "Login Required",
        text: "Please login again before placing your order.",
        confirmButtonColor: PINK,
      });
      return;
    }

    if (role !== "customer") {
      Swal.fire({
        icon: "warning",
        title: "Customer Account Required",
        text: "Only customer accounts can place store orders.",
        confirmButtonColor: PINK,
      });
      return;
    }

    if (!cart.length) {
      Swal.fire({
        icon: "warning",
        title: "Cart Empty",
        text: "Please add products to your cart before checkout.",
        confirmButtonColor: PINK,
      });
      return;
    }

    if (!customerName.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Customer Name Required",
        text: "Please enter your name before placing the order.",
        confirmButtonColor: PINK,
      });
      return;
    }

    // Payment proof is no longer required during checkout
    // Customer will upload proof after receptionist approval

    const invalidItem = cart.find((item) => !item.inStock || item.qty > item.stock);

    if (invalidItem) {
      Swal.fire({
        icon: "warning",
        title: "Stock Issue",
        text: `${invalidItem.name} has insufficient stock. Please adjust your cart.`,
        confirmButtonColor: PINK,
      });
      return;
    }

    setIsProcessing(true);

    try {
      const orderId = generateOrderId();
      const refNumber = generateRefNumber();

      const payload = {
        items: cart.map((item) => {
          const quantity = Number(item.qty || 1);
          const price = Number(getItemPrice(item) || 0);

          return {
            id: item.id,
            product_id: item.id,
            inventory_item_id: item.id,
            name: item.name,
            product_name: item.name,
            sku: item.sku || null,
            price,
            unit_price: price,
            qty: quantity,
            quantity,
            stock: Number(item.stock || 0),
            subtotal: price * quantity,
            line_total: price * quantity,
          };
        }),
        subtotal: Number(getSubtotal() || 0),
        totalAmount: Number(getTotal() || 0),
        total_amount: Number(getTotal() || 0),
        discountApplied: Number(discountApplied || 0),
        discount_applied: Number(discountApplied || 0),
        discountAmount: Number(getDiscountAmount() || 0),
        discount_amount: Number(getDiscountAmount() || 0),
        paymentMethod: selectedPaymentMethod?.label || paymentMethod,
        payment_method: selectedPaymentMethod?.label || paymentMethod,
        // Payment proof will be uploaded after approval
        orderId,
        order_id: orderId,
        referenceNumber: refNumber,
        reference_number: refNumber,
        customerName: customerName.trim() || localStorage.getItem("name") || "Customer",
        customer_name: customerName.trim() || localStorage.getItem("name") || "Customer",
        orderType: "Pick-up",
        order_type: "Pick-up",
        status: "pending",
        payment_status: "unpaid",
      };

const data = await apiRequest("/customer/store/checkout", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const newOrder = {
        id: data?.orderId || data?.order_id || data?.id || orderId,
        referenceNumber: data?.referenceNumber || data?.reference_number || refNumber,
        items: [...cart],
        subtotal: getSubtotal(),
        discountAmount: getDiscountAmount(),
        discountApplied,
        total: getTotal(),
        paymentMethod: selectedPaymentMethod?.label || paymentMethod,
        customerName: customerName.trim() || localStorage.getItem("name") || "Customer",
        date: new Date().toLocaleDateString("en-PH", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        time: new Date().toLocaleTimeString("en-PH", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: "Pending Confirmation",
      };

      setLastOrder(newOrder);
      setOrderHistory((prev) => [newOrder, ...prev]);
      setCart([]);
      setDiscountApplied(0);
      setDiscountCode("");
      setCheckoutStep("receipt");
      inventorySync.getProducts(true);

      Swal.fire({
        icon: "success",
        title: "Order Submitted!",
        text: `Order #${newOrder.id} has been submitted successfully. Please wait for receptionist approval before uploading payment proof.`,
        confirmButtonColor: PINK,
      });
    } catch (error) {
      console.error("Checkout error:", error);

      const status = error?.status || error?.response?.status;

      if (status === 401) {
        // Unauthorized error handled by Swal.fire message
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const openQuickView = (product) => {
    setSelectedProduct(product);
    setShowQuickView(true);
  };

  const handlePrint = () => window.print();

  return (
    <>
      <GlobalStyle />

      <StorePage className="customer-store">
        <StoreHeader>
          <HeaderInner>
            <HeaderTitle>
              <FontAwesomeIcon icon={faStore} /> Pawesome Store
            </HeaderTitle>

            <HeaderActions>
              <SearchBar>
                <FontAwesomeIcon icon={faSearch} />
                <SearchInput
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </SearchBar>

              <WishlistBtn onClick={() => setCategory("Wishlist")}>
                <FontAwesomeIcon icon={faHeart} />
                Wishlist
                {wishlist.length > 0 && <WishlistBadge>{wishlist.length}</WishlistBadge>}
              </WishlistBtn>
            </HeaderActions>
          </HeaderInner>
        </StoreHeader>

        <StoreContent>
          <Sidebar>
            <SidebarSection>
              <SidebarTitle>Categories</SidebarTitle>

              <CategoryList>
                {Object.keys(currentStoreData).map((cat) => (
                  <CategoryBtn
                    key={cat}
                    $active={category === cat}
                    onClick={() => setCategory(cat)}
                  >
                    <FontAwesomeIcon icon={getCategoryIcon(cat)} />
                    {cat}
                  </CategoryBtn>
                ))}
              </CategoryList>
            </SidebarSection>

            <SidebarSection>
              <SidebarTitle>
                <FontAwesomeIcon icon={faFilter} /> Filters
              </SidebarTitle>

              <PriceRange>
                <FilterInput
                  type="number"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={(e) =>
                    setPriceRange({
                      ...priceRange,
                      min: parseInt(e.target.value, 10) || 0,
                    })
                  }
                />

                <span>–</span>

                <FilterInput
                  type="number"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) =>
                    setPriceRange({
                      ...priceRange,
                      max: parseInt(e.target.value, 10) || 2000,
                    })
                  }
                />
              </PriceRange>

              <div style={{ marginTop: 12 }}>
                <FilterSelect value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="name">Sort: Name</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Rating</option>
                </FilterSelect>
              </div>
            </SidebarSection>

            <SidebarSection>
              <SidebarTitle>
                <FontAwesomeIcon icon={faHistory} /> Recent Orders
              </SidebarTitle>

              {orderHistory.length === 0 ? (
                <p style={{ fontSize: 13, color: "var(--store-muted, #64748b)" }}>
                  No orders yet
                </p>
              ) : (
                <OrderHistoryList>
                  {orderHistory.slice(0, 3).map((order, idx) => (
                    <HistoryItem
                      key={getOrderId(order) || idx}
                      $status={normalizeOrderStatus(order.status)}
                    >
                      <div className="order-id">#{getOrderId(order)}</div>

                      <div className="order-amount">
                        ₱{getOrderAmount(order).toFixed(2)}
                      </div>

                      <span className="order-status">
                        {order.status || order.payment_status || "Pending"}
                      </span>
                    </HistoryItem>
                  ))}
                </OrderHistoryList>
              )}
            </SidebarSection>
          </Sidebar>

          <MainArea>
            {category === "Wishlist" ? (
              <>
                <CategoryHeader>
                  <CategoryTitle>My Wishlist</CategoryTitle>
                  <ProductCount>
                    <FontAwesomeIcon icon={faHeart} /> {wishlist.length} items
                  </ProductCount>
                </CategoryHeader>

                {wishlist.length === 0 ? (
                  <EmptyState>
                    <FontAwesomeIcon icon={faHeart} />
                    <h3>Your wishlist is empty</h3>
                    <p>Start adding products you love</p>
                    <button onClick={() => setCategory("Food")}>Start Shopping</button>
                  </EmptyState>
                ) : (
                  <WishlistGrid>
                    {wishlist.map((item) => (
                      <WishlistCard key={item.id}>
                        <WishlistImage>{item.image}</WishlistImage>

                        <WishlistInfo>
                          <h4>{item.name}</h4>
                          <ProductRating>
                            {renderStars(item.rating)}
                            <span className="reviews">({item.reviews})</span>
                          </ProductRating>
                          <p>₱{item.price}</p>
                        </WishlistInfo>

                        <WishlistActions>
                          <ProductBtn
                            $variant="primary"
                            onClick={() => addToCart(item)}
                            disabled={!item.inStock}
                          >
                            <FontAwesomeIcon icon={faShoppingCart} />
                            {item.inStock ? "Add to Cart" : "Out of Stock"}
                          </ProductBtn>

                          <ProductBtn $variant="icon" $active onClick={() => toggleWishlist(item)}>
                            <FontAwesomeIcon icon={faTimes} />
                          </ProductBtn>
                        </WishlistActions>
                      </WishlistCard>
                    ))}
                  </WishlistGrid>
                )}
              </>
            ) : (
              <>
                <CategoryHeader>
                  <CategoryTitle>{category}</CategoryTitle>
                  <ProductCount>
                    <FontAwesomeIcon icon={faBox} /> {filteredProducts.length} products
                  </ProductCount>
                </CategoryHeader>

                {filteredProducts.length === 0 ? (
                  <EmptyState>
                    <FontAwesomeIcon icon={faBoxOpen} />
                    <h3>No products found</h3>
                    <p>Try adjusting your filters or search terms</p>
                  </EmptyState>
                ) : (
                  <ProductsGrid>
                    {filteredProducts.map((item) => (
                      <ProductCard key={item.id}>
                        <ProductImage>
                          {item.discount > 0 && (
                            <ProductBadge $type="discount">-{item.discount}%</ProductBadge>
                          )}

                          {item.stock <= 5 && item.inStock && (
                            <ProductBadge $type="low">Low Stock</ProductBadge>
                          )}

                          {!item.inStock && (
                            <ProductBadge $type="out">Out of Stock</ProductBadge>
                          )}

                          <span style={{ fontSize: 48 }}>{item.image}</span>
                        </ProductImage>

                        <ProductInfo>
                          <ProductName>{item.name}</ProductName>

                          <ProductRating>
                            {renderStars(item.rating)}
                            <span className="reviews">({item.reviews})</span>
                          </ProductRating>

                          <ProductPrice>
                            {item.discount > 0 ? (
                              <>
                                <span className="original">₱{item.price}</span>
                                <span className="discounted">
                                  ₱{Math.round(item.price * (1 - item.discount / 100))}
                                </span>
                              </>
                            ) : (
                              <span className="current">₱{item.price}</span>
                            )}
                          </ProductPrice>
                        </ProductInfo>

                        <ProductActions>
                          <ProductBtn
                            $variant="icon"
                            $active={!!wishlist.find((w) => w.id === item.id)}
                            onClick={() => toggleWishlist(item)}
                          >
                            <FontAwesomeIcon icon={faHeart} />
                          </ProductBtn>

                          <ProductBtn $variant="secondary" onClick={() => openQuickView(item)}>
                            <FontAwesomeIcon icon={faEye} />
                          </ProductBtn>

                          <ProductBtn
                            $variant="primary"
                            onClick={() => addToCart(item)}
                            disabled={!item.inStock}
                          >
                            <FontAwesomeIcon icon={faShoppingCart} />
                          </ProductBtn>
                        </ProductActions>
                      </ProductCard>
                    ))}
                  </ProductsGrid>
                )}
              </>
            )}
          </MainArea>

          <CartPanel>
            {checkoutStep === "cart" && (
              <>
                <CartTitle>
                  <FontAwesomeIcon icon={faShoppingCart} /> Shopping Cart
                </CartTitle>

                {cart.length === 0 ? (
                  <EmptyCart>
                    <FontAwesomeIcon icon={faShoppingCart} />
                    <p>Your cart is empty</p>
                  </EmptyCart>
                ) : (
                  <>
                    <CartItems>
                      {cart.map((item) => (
                        <CartItem key={item.id}>
                          <CartItemImage>{item.image}</CartItemImage>

                          <CartItemInfo>
                            <div className="name">{item.name}</div>
                            <div className="price">
                              ₱
                              {item.discount > 0
                                ? Math.round(getItemPrice(item))
                                : item.price}
                            </div>
                          </CartItemInfo>

                          <QtyControls>
                            <button onClick={() => updateQty(item.id, -1)}>
                              <FontAwesomeIcon icon={faMinus} />
                            </button>

                            <span>{item.qty}</span>

                            <button onClick={() => updateQty(item.id, 1)}>
                              <FontAwesomeIcon icon={faPlus} />
                            </button>
                          </QtyControls>

                          <RemoveBtn onClick={() => removeFromCart(item.id)}>
                            <FontAwesomeIcon icon={faTrash} />
                          </RemoveBtn>
                        </CartItem>
                      ))}
                    </CartItems>

                    <DiscountSection>
                      <input
                        type="text"
                        placeholder="Discount code"
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && applyDiscount()}
                      />
                      <button onClick={applyDiscount}>Apply</button>
                    </DiscountSection>

                    {discountApplied > 0 && (
                      <DiscountApplied>
                        <FontAwesomeIcon icon={faCheckCircle} />
                        {discountApplied}% discount applied!
                      </DiscountApplied>
                    )}

                    <CartSummary>
                      <SummaryRow>
                        <span>Subtotal</span>
                        <span>₱{getSubtotal().toFixed(2)}</span>
                      </SummaryRow>

                      {discountApplied > 0 && (
                        <SummaryRow $type="discount">
                          <span>Discount ({discountApplied}%)</span>
                          <span>-₱{getDiscountAmount().toFixed(2)}</span>
                        </SummaryRow>
                      )}

                      <SummaryRow $type="total">
                        <span>Total</span>
                        <span>₱{getTotal().toFixed(2)}</span>
                      </SummaryRow>
                    </CartSummary>

                    <CheckoutBtn onClick={proceedCheckout} disabled={!cart.length}>
                      <FontAwesomeIcon icon={faChevronRight} />
                      Proceed to Checkout
                    </CheckoutBtn>
                  </>
                )}
              </>
            )}

            {checkoutStep === "payment" && (
              <>
                <CartTitle>
                  <FontAwesomeIcon icon={faCreditCard} /> Checkout
                </CartTitle>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <p style={{ fontSize: 12, fontWeight: 900, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Order Summary
                  </p>

                  <OrderSummaryList>
                    {cart.map((item) => (
                      <SummaryItem key={item.id}>
                        <span>{item.name} × {item.qty}</span>
                        <span>₱{(getItemPrice(item) * item.qty).toFixed(2)}</span>
                      </SummaryItem>
                    ))}

                    {discountApplied > 0 && (
                      <SummaryItem style={{ color: "#16a34a" }}>
                        <span>Discount ({discountApplied}%)</span>
                        <span style={{ color: "#16a34a" }}>-₱{getDiscountAmount().toFixed(2)}</span>
                      </SummaryItem>
                    )}

                    <SummaryItem style={{ borderTop: "1px dashed rgba(255,95,147,0.2)", paddingTop: 8, marginTop: 4 }}>
                      <span style={{ fontWeight: 950, fontSize: 14 }}>Total</span>
                      <span style={{ color: PINK, fontSize: 16, fontWeight: 950 }}>
                        ₱{getTotal().toFixed(2)}
                      </span>
                    </SummaryItem>
                  </OrderSummaryList>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <p style={{ fontSize: 12, fontWeight: 900, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Your Name
                  </p>

                  <div style={{ position: "relative" }}>
                    <FontAwesomeIcon
                      icon={faUser}
                      style={{
                        position: "absolute",
                        left: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: PINK,
                        fontSize: 13,
                      }}
                    />

                    <FilterInput
                      style={{ paddingLeft: 36, height: 42, borderRadius: 14, fontSize: 13 }}
                      placeholder="Enter your name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <p style={{ fontSize: 12, fontWeight: 900, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Payment Method
                  </p>

                  <PaymentMethodGrid>
                    {PAYMENT_METHODS.map((pm) => (
                      <PaymentMethodCard
                        key={pm.id}
                        $active={paymentMethod === pm.id}
                        $color={pm.color}
                        onClick={() => {
                          setPaymentMethod(pm.id);
                        }}
                      >
                        <div className="pm-icon">
                          <FontAwesomeIcon icon={pm.icon} />
                        </div>
                        <div className="pm-label">{pm.label}</div>
                        <div className="pm-desc">{pm.description}</div>
                        <div className="pm-check">
                          <FontAwesomeIcon icon={faCheck} />
                        </div>
                      </PaymentMethodCard>
                    ))}
                  </PaymentMethodGrid>
                </div>

                {selectedPaymentMethod && (
                  <PaymentDetailsBox>
                    <PaymentDetailsHeader $color={selectedPaymentMethod.color}>
                      <FontAwesomeIcon icon={selectedPaymentMethod.icon} />
                      {selectedPaymentMethod.label} Payment Details
                    </PaymentDetailsHeader>

                    {selectedPaymentMethod.id === "credit_card" ? (
                      <div style={{ padding: "16px" }}>
                        <p style={{ fontSize: 13, color: "#64748b", textAlign: "center", lineHeight: 1.5 }}>
                          You will be redirected to our secure payment gateway upon order confirmation.
                          Visa, Mastercard, and JCB cards are accepted.
                        </p>

                        <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center", marginTop: 12, color: "#94a3b8", fontSize: 12 }}>
                          <FontAwesomeIcon icon={faShieldAlt} />
                          <span>256-bit SSL encrypted</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        {selectedPaymentMethod.qrPlaceholder && (
                          <QRCodePlaceholder style={{ margin: "12px 16px 0", borderRadius: 12 }}>
                            <FontAwesomeIcon icon={faQrcode} />
                            <div className="qr-label">{selectedPaymentMethod.qrPlaceholder}</div>
                            <p>Scan to pay via {selectedPaymentMethod.label}</p>
                          </QRCodePlaceholder>
                        )}

                        {selectedPaymentMethod.accountName && (
                          <PaymentDetailRow>
                            <span className="pd-label">Account Name</span>
                            <span className="pd-value">
                              {selectedPaymentMethod.accountName}
                              <CopyBtn onClick={() => copyToClipboard(selectedPaymentMethod.accountName)}>
                                <FontAwesomeIcon icon={faCopy} />
                              </CopyBtn>
                            </span>
                          </PaymentDetailRow>
                        )}

                        {selectedPaymentMethod.accountNumber && (
                          <PaymentDetailRow>
                            <span className="pd-label">
                              {selectedPaymentMethod.id === "bank_transfer" ? "Account No." : "Number"}
                            </span>
                            <span className="pd-value">
                              {selectedPaymentMethod.accountNumber}
                              <CopyBtn onClick={() => copyToClipboard(selectedPaymentMethod.accountNumber)}>
                                <FontAwesomeIcon icon={faCopy} />
                              </CopyBtn>
                            </span>
                          </PaymentDetailRow>
                        )}

                        {selectedPaymentMethod.bankName && (
                          <PaymentDetailRow>
                            <span className="pd-label">Bank</span>
                            <span className="pd-value">{selectedPaymentMethod.bankName}</span>
                          </PaymentDetailRow>
                        )}

                        <PaymentDetailRow>
                          <span className="pd-label">Amount to Send</span>
                          <span className="pd-value" style={{ color: PINK, fontSize: 15 }}>
                            ₱{getTotal().toFixed(2)}
                            <CopyBtn onClick={() => copyToClipboard(getTotal().toFixed(2))}>
                              <FontAwesomeIcon icon={faCopy} />
                            </CopyBtn>
                          </span>
                        </PaymentDetailRow>
                      </>
                    )}
                  </PaymentDetailsBox>
                )}

                {/* Payment proof upload removed - customer will upload after receptionist approval */}

                <div style={{ display: "flex", gap: 10 }}>
                  <BackBtn onClick={() => setCheckoutStep("cart")}>← Back</BackBtn>

                  <ConfirmBtn
                    onClick={confirmPayment}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <SpinnerIcon icon={faSpinner} /> Processing…
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faCheck} /> Place Order
                      </>
                    )}
                  </ConfirmBtn>
                </div>
              </>
            )}

            {checkoutStep === "receipt" && lastOrder && (
              <>
                <CartTitle>
                  <FontAwesomeIcon icon={faReceipt} /> Order Receipt
                </CartTitle>

                <div style={{ fontSize: 12, color: "#64748b", textAlign: "center" }}>
                  Your order is pending confirmation. Stock will be deducted once approved.
                </div>

                <div
                  style={{
                    background: "rgba(34,197,94,0.08)",
                    border: "1px solid rgba(34,197,94,0.2)",
                    borderRadius: 14,
                    padding: "14px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <FontAwesomeIcon icon={faCheckCircle} style={{ color: "#16a34a", fontSize: 20 }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 950, color: "#15803d" }}>
                      Order Submitted!
                    </div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>
                      Awaiting approval / payment verification
                    </div>
                  </div>
                </div>

                <ReceiptPaper>
                  <ReceiptHeader>
                    <h3>🐾 PAWESOME STORE</h3>
                    <p>Official Order Receipt</p>
                  </ReceiptHeader>

                  <ReceiptBody>
                    <ReceiptInfoGrid>
                      <ReceiptInfoItem>
                        <span className="ri-label">
                          <FontAwesomeIcon icon={faHashtag} /> Order ID
                        </span>
                        <span className="ri-value" style={{ fontSize: 11 }}>
                          {lastOrder.id}
                        </span>
                      </ReceiptInfoItem>

                      <ReceiptInfoItem>
                        <span className="ri-label">
                          <FontAwesomeIcon icon={faCalendarAlt} /> Date
                        </span>
                        <span className="ri-value" style={{ fontSize: 11 }}>
                          {lastOrder.date}
                        </span>
                      </ReceiptInfoItem>

                      <ReceiptInfoItem>
                        <span className="ri-label">
                          <FontAwesomeIcon icon={faUser} /> Customer
                        </span>
                        <span className="ri-value" style={{ fontSize: 12 }}>
                          {lastOrder.customerName || "—"}
                        </span>
                      </ReceiptInfoItem>

                      <ReceiptInfoItem>
                        <span className="ri-label">
                          <FontAwesomeIcon icon={faCreditCard} /> Payment
                        </span>
                        <span className="ri-value" style={{ fontSize: 11 }}>
                          {lastOrder.paymentMethod}
                        </span>
                      </ReceiptInfoItem>

                      <ReceiptInfoItem style={{ gridColumn: "1 / -1" }}>
                        <span className="ri-label">
                          <FontAwesomeIcon icon={faQrcode} /> Reference No.
                        </span>
                        <span
                          className="ri-value"
                          style={{
                            fontSize: 13,
                            color: PINK,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                          onClick={() => copyToClipboard(lastOrder.referenceNumber)}
                        >
                          {lastOrder.referenceNumber}
                          <FontAwesomeIcon icon={faCopy} style={{ fontSize: 11, color: "#94a3b8" }} />
                        </span>
                      </ReceiptInfoItem>
                    </ReceiptInfoGrid>

                    <ReceiptDivider />

                    <ReceiptItemsList>
                      {lastOrder.items.map((item) => (
                        <ReceiptLineItem key={item.id}>
                          <span className="ri-name">
                            {item.image} {item.name}
                          </span>
                          <span className="ri-qty">×{item.qty}</span>
                          <span className="ri-price">
                            ₱{(getItemPrice(item) * item.qty).toFixed(2)}
                          </span>
                        </ReceiptLineItem>
                      ))}
                    </ReceiptItemsList>

                    <ReceiptDivider />

                    <ReceiptTotals>
                      <ReceiptTotalRow>
                        <span>Subtotal</span>
                        <span>₱{lastOrder.subtotal.toFixed(2)}</span>
                      </ReceiptTotalRow>

                      {lastOrder.discountApplied > 0 && (
                        <ReceiptTotalRow $discount>
                          <span>Discount ({lastOrder.discountApplied}%)</span>
                          <span>-₱{lastOrder.discountAmount.toFixed(2)}</span>
                        </ReceiptTotalRow>
                      )}

                      <ReceiptTotalRow $grand>
                        <span>TOTAL</span>
                        <span>₱{lastOrder.total.toFixed(2)}</span>
                      </ReceiptTotalRow>
                    </ReceiptTotals>
                  </ReceiptBody>

                  <ReceiptFooter>
                    <div className="rf-status">
                      <FontAwesomeIcon icon={faExclamationTriangle} />
                      Pending Confirmation
                    </div>
                    <div className="rf-note">
                      Stock will be deducted once your order is approved.
                    </div>
                    <div className="rf-thank">
                      Thank you for shopping with us! 🐾
                    </div>
                  </ReceiptFooter>
                </ReceiptPaper>

                <div style={{ display: "flex", gap: 8 }}>
                  <ReceiptActionBtn onClick={handlePrint}>
                    <FontAwesomeIcon icon={faPrint} /> Print
                  </ReceiptActionBtn>

                  <ReceiptActionBtn
                    $primary
                    onClick={() => {
                      setCheckoutStep("cart");
                      setLastOrder(null);
                    }}
                  >
                    <FontAwesomeIcon icon={faShoppingCart} /> Continue Shopping
                  </ReceiptActionBtn>
                </div>
              </>
            )}
          </CartPanel>
        </StoreContent>
      </StorePage>

      {showQuickView && selectedProduct && (
        <ModalOverlay onClick={() => setShowQuickView(false)}>
          <Modal $width="640px" onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h2>Quick View</h2>
              <CloseBtn onClick={() => setShowQuickView(false)}>
                <FontAwesomeIcon icon={faTimes} />
              </CloseBtn>
            </ModalHeader>

            <ModalBody>
              <QuickViewContent>
                <QuickViewImage>{selectedProduct.image}</QuickViewImage>

                <QuickViewDetails>
                  <div className="qv-name">{selectedProduct.name}</div>

                  <div className="qv-rating">
                    {renderStars(selectedProduct.rating)}
                    <span>({selectedProduct.reviews} reviews)</span>
                  </div>

                  <div className="qv-price">₱{selectedProduct.price}</div>

                  {selectedProduct.sku && (
                    <div className="qv-sku">SKU: {selectedProduct.sku}</div>
                  )}

                  <span
                    className={`qv-stock ${
                      selectedProduct.inStock ? "in-stock" : "out-of-stock"
                    }`}
                  >
                    {selectedProduct.inStock
                      ? `✓ In Stock (${selectedProduct.stock} left)`
                      : "✗ Out of Stock"}
                  </span>

                  {selectedProduct.description && (
                    <div className="qv-description">{selectedProduct.description}</div>
                  )}

                  <QuickViewActions>
                    <ProductBtn
                      $variant="icon"
                      $active={!!wishlist.find((w) => w.id === selectedProduct.id)}
                      onClick={() => toggleWishlist(selectedProduct)}
                    >
                      <FontAwesomeIcon icon={faHeart} />
                    </ProductBtn>

                    <ProductBtn
                      $variant="primary"
                      onClick={() => {
                        addToCart(selectedProduct);
                        setShowQuickView(false);
                      }}
                      disabled={!selectedProduct.inStock}
                    >
                      <FontAwesomeIcon icon={faShoppingCart} />
                      {selectedProduct.inStock ? "Add to Cart" : "Out of Stock"}
                    </ProductBtn>
                  </QuickViewActions>
                </QuickViewDetails>
              </QuickViewContent>
            </ModalBody>
          </Modal>
        </ModalOverlay>
      )}
    </>
  );
}