with open('src/App.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Update header padding transition
old_header = """          {/* Card Header */}
          <div 
            className={`px-4 cursor-pointer flex items-start justify-between ${!isDay && !isExpanded ? 'py-2' : 'py-4'}`}
            onClick={onToggle}
          >"""

new_header = """          {/* Card Header */}
          <div 
            className={`px-4 cursor-pointer flex items-start justify-between transition-all duration-300 ease-in-out ${!isDay && !isExpanded ? 'py-2' : 'py-4'}`}
            onClick={onToggle}
          >"""

if old_header in code:
    code = code.replace(old_header, new_header)
else:
    print("WARNING: Could not patch header")

# 2. Update Expanded Details transition
old_expansion = """          {/* Expanded Details */}
          <div 
            className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
          >
            <div className="overflow-hidden">
                <div className="px-4 pb-4">"""

new_expansion = """          {/* Expanded Details */}
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4">"""

if old_expansion in code:
    code = code.replace(old_expansion, new_expansion)
else:
    print("WARNING: Could not patch expansion start")

# Now we need to find where the expanded details close.
# It ends with:
#                   )}
#                 </div>
#             </div>
#           </div>
#        </motion.div>

old_expansion_end = """                  )}
                </div>
            </div>
          </div>
       </motion.div>"""

new_expansion_end = """                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
       </motion.div>"""

if old_expansion_end in code:
    code = code.replace(old_expansion_end, new_expansion_end)
else:
    print("WARNING: Could not patch expansion end")

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

