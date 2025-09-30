//Ubicacion: DCO/apps/frontend/src/app/approve/layout.js

import React from 'react';
import styles from './ApprovalLayout.module.scss'; // Assuming a new SCSS module for this layout

export default function PublicLayout({ children }) {
      return (
        <div className={styles.scrollableContainer}>
          {children}
        </div>
      );
    }