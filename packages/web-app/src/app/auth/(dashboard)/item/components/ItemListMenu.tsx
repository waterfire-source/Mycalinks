import React, { useState } from 'react';
import { Menu, MenuItem } from '@mui/material';
import { MycaItemsModalContainer } from '@/app/auth/(dashboard)/item/components/MycaItemsModalContainer';
import { MycaItemGenreSelectionModal } from '@/app/auth/(dashboard)/item/components/MycaItemGenreSelectionModal';
import { ItemRegisterModal } from '@/app/auth/(dashboard)/item/components/ItemRegisterModal';
import { MycaPackItemsModalContainer } from '@/app/auth/(dashboard)/item/components/MycaPackItemsModalContainer';

interface NewItemMenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
}

export const ItemListMenu: React.FC<NewItemMenuProps> = ({
  anchorEl,
  open,
  onClose,
}) => {
  const [subMenuAnchorEl, setSubMenuAnchorEl] = useState<HTMLElement | null>(
    null,
  );
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isMycaItemsModalOpen, setIsMycaItemsModalOpen] = useState(false);
  const [isMycaItemPackModalOpen, setIsMycaItemPackModalOpen] = useState(false);
  const [isMycaItemGenreModalOpen, setIsMycaItemGenreModalOpen] =
    useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  return (
    <>
      {/* メインメニュー */}
      <Menu anchorEl={anchorEl} open={open} onClose={onClose}>
        <MenuItem
          onClick={() => {
            setIsRegisterModalOpen(true); // 商品登録モーダルを開く
            setSubMenuAnchorEl(null); // サブメニューを閉じる
          }}
        >
          独自に商品情報を登録
        </MenuItem>
        <MenuItem
          onClick={(event) => setSubMenuAnchorEl(event.currentTarget)} // サブメニューを開く
        >
          Mycalinksから登録
        </MenuItem>
      </Menu>

      {/* サブメニュー */}
      <Menu
        anchorEl={subMenuAnchorEl}
        open={Boolean(subMenuAnchorEl)}
        onClose={() => setSubMenuAnchorEl(null)} // サブメニューを閉じる
      >
        <MenuItem
          onClick={() => {
            setIsMycaItemsModalOpen(true); // MycaItemsModalContainerを開く
            setSubMenuAnchorEl(null); // サブメニューを閉じる
          }}
        >
          商品を検索して登録
        </MenuItem>
        <MenuItem
          onClick={() => {
            setIsMycaItemPackModalOpen(true); // MycaItemsModalContainerを開く
            setSubMenuAnchorEl(null); // サブメニューを閉じる
          }}
        >
          指定したBOXに含まれるカードをすべて登録
        </MenuItem>
        <MenuItem
          onClick={() => {
            setIsMycaItemGenreModalOpen(true); // ジャンル選択モーダルを開く
            setSubMenuAnchorEl(null); // サブメニューを閉じる
          }}
        >
          指定したジャンルのカードをすべて登録
        </MenuItem>
      </Menu>

      {/* 商品登録モーダル */}
      {isRegisterModalOpen && (
        <ItemRegisterModal
          open={isRegisterModalOpen}
          onClose={() => setIsRegisterModalOpen(false)} // 商品登録モーダルを閉じる
          item={null}
        />
      )}

      {/* myca appから商品を検索して登録するモーダル */}
      {isMycaItemsModalOpen && (
        <MycaItemsModalContainer
          open={isMycaItemsModalOpen}
          onClose={() => setIsMycaItemsModalOpen(false)} // MycaLinksモーダルを閉じる
        />
      )}

      {/* myca appからパック商品を検索して登録するモーダル */}
      {isMycaItemPackModalOpen && (
        <MycaPackItemsModalContainer
          open={isMycaItemPackModalOpen}
          onClose={() => setIsMycaItemPackModalOpen(false)} // MycaLinksモーダルを閉じる
        />
      )}

      {/* ジャンルを選択して登録するモーダル */}
      {isMycaItemGenreModalOpen && (
        <MycaItemGenreSelectionModal
          open={isMycaItemGenreModalOpen}
          onClose={() => setIsMycaItemGenreModalOpen(false)} // ジャンルモーダルを閉じる
          selectedItems={selectedItems}
          setSelectedItems={setSelectedItems}
        />
      )}
    </>
  );
};
