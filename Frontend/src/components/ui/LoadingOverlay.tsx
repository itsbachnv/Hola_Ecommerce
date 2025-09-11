'use client';

import { useLoadingStore } from '@/stores/loading';
import { AnimatePresence, motion } from 'framer-motion';

const loadingMessages = {
  default: 'Đang xử lý...',
  creating: 'Đang tạo mới...',
  updating: 'Đang cập nhật...',
  deleting: 'Đang xóa...',
  saving: 'Đang lưu...'
};

const loadingIcons = {
  default: '⏳',
  creating: '✨',
  updating: '🔄',
  deleting: '🗑️',
  saving: '💾'
};

export default function LoadingOverlay() {
  const { loading } = useLoadingStore();

  return (
    <AnimatePresence>
      {loading.isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
            className="bg-white rounded-2xl p-8 max-w-sm mx-4 text-center shadow-xl"
          >
            {/* Loading Animation */}
            <div className="mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  className="text-2xl"
                >
                  {loading.loadingType === 'updating' ? '🔄' : 
                   loading.loadingType === 'creating' ? '✨' :
                   loading.loadingType === 'deleting' ? '🗑️' :
                   loading.loadingType === 'saving' ? '💾' : '⏳'}
                </motion.div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <motion.div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </div>
            </div>

            {/* Loading Text */}
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {loading.loadingText || loadingMessages[loading.loadingType]}
            </h3>
            
            <p className="text-sm text-gray-500">
              Vui lòng đợi trong giây lát...
            </p>

            {/* Animated Dots */}
            <div className="flex justify-center mt-4 space-x-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-blue-500 rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
