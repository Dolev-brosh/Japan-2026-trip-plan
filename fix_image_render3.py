import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

out = []
in_ticket = False
in_reminder = False

for i, line in enumerate(lines):
    if "{/* Ticket Content */}" in line:
        in_ticket = True
    if "{/* Reminder Content */}" in line:
        in_ticket = False
        in_reminder = True
    if "const EditModal" in line:
        in_reminder = False
        
    out.append(line)
    
    # We want to insert right before the closing `</div>` of the Ticket Content block
    # and the Reminder Content block.
    # Actually, a safer way is to just look for `  {isTicket && (` and `  {isReminder && (` and then find their matching closing tag, but that's hard.
    
    # Let's find:
    #                       )}
    #                     </div>
    #                   )}
    # The line right before `                  )}` could be `                    </div>`
    if in_ticket and "                    </div>" in line and "                  )}" in lines[i+1]:
        out.pop() # remove `                    </div>`
        out.append("""                      {day.imageUrl && (
                        <div className="mt-4" onClick={e => e.stopPropagation()}>
                          <Zoom>
                            <img src={day.imageUrl} alt="Attachment" className="w-full h-auto object-cover rounded-lg border border-black/10" />
                          </Zoom>
                        </div>
                      )}
                    </div>\n""")
        in_ticket = False # done for ticket

    if in_reminder and "                    </div>" in line and "                  )}" in lines[i+1]:
        out.pop()
        out.append("""                      {day.imageUrl && (
                        <div className="mt-4" onClick={e => e.stopPropagation()}>
                          <Zoom>
                            <img src={day.imageUrl} alt="Attachment" className="w-full h-auto object-cover rounded-lg border border-black/10" />
                          </Zoom>
                        </div>
                      )}
                    </div>\n""")
        in_reminder = False # done for reminder

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.writelines(out)

