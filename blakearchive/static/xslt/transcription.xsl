<!-- William Blake Archive transcription.xsl Last Modified 2005-03-20 Aziza Technology Associates,LLC
transforms transcriptions
-->
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:exist="http://exist.sourceforge.net/NS/exist" version="1.0">
    <!--<xsl:include href="includes.xsl"/>-->
    <xsl:include href="wba_ms_test.xsl"/>
    <xsl:template match="/">
        <div>
            <xsl:apply-templates/>
        </div>
    </xsl:template>
    <xsl:template match="@*|node()">
        <xsl:copy>
            <xsl:apply-templates select="@*|node()"/>
        </xsl:copy>
    </xsl:template>
    <xsl:template match="lb">
        <br/>
    </xsl:template>
    <xsl:template match="columns">
        <table class="tei-columns-table">
            <tr>
                <xsl:apply-templates/>
            </tr>
        </table>
    </xsl:template>
    <xsl:template match="column">
        <xsl:variable name="colwidth">
            <xsl:value-of select="round(100 div count(../column))"/>
        </xsl:variable>
        <td class="tei-columns-table-data"> <!-- valign="top" -->
            <xsl:attribute name="width">
                <xsl:value-of select="$colwidth"/>%
            </xsl:attribute>
            <xsl:apply-templates/>
        </td>
    </xsl:template>
    <xsl:template match="results">
        <div>
            <xsl:attribute name="class">
                <xsl:value-of select="@class"/>
            </xsl:attribute>
            <xsl:apply-templates/>
        </div>
    </xsl:template>
    <xsl:template match="div">
        <xsl:copy-of select="."/>
    </xsl:template>
    <xsl:template match="vspace">
        <div class="tei-vspace"> <!-- font-size: 15pt -->
            <xsl:attribute name="style">padding-bottom:<xsl:value-of select="@extent"/>em</xsl:attribute>
        </div>
    </xsl:template>
    <xsl:template match="linespan"/>
    <xsl:template match="texthead|textfoot">
        <xsl:param name="colnum">
            <xsl:for-each select="ancestor::columns/column">
                <xsl:value-of select="last()"/>
            </xsl:for-each>
        </xsl:param>
        <xsl:choose>
            <xsl:when test="ancestor::columns">
                <xsl:choose>
                    <xsl:when test="$colnum='333'">
                        <table class="tei-table-extra-small"><!-- width="266" -->
                            <xsl:attribute name="style">text-align:
                                <xsl:value-of select="@justify"/>
                            </xsl:attribute>
                            <xsl:apply-templates/>
                        </table>
                    </xsl:when>
                    <xsl:otherwise>
                        <table class="tei-table-small"> <!-- width="360" -->
                            <xsl:attribute name="style">text-align:
                                <xsl:value-of select="@justify"/>
                            </xsl:attribute>
                            <xsl:apply-templates/>
                        </table>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:when>
            <xsl:otherwise>
                <xsl:choose>
                    <xsl:when test="@rend">
                        <table>
                            <xsl:attribute name="width">
                                <xsl:value-of select="substring-after(@rend, 'width:')"/>
                            </xsl:attribute>
                            <xsl:attribute name="style">text-align:
                                <xsl:value-of select="@justify"/>
                            </xsl:attribute>
                            <xsl:apply-templates/>
                        </table>
                    </xsl:when>
                    <xsl:otherwise>
                        <table class="tei-table"> <!-- width="850" -->
                            <xsl:attribute name="style">text-align:<xsl:value-of select="@justify"/></xsl:attribute>
                            <xsl:apply-templates/>
                        </table>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    <xsl:template match="lg">
        <xsl:param name="column">
            <xsl:for-each select="ancestor::columns/column">
                <xsl:value-of select="last()"/>
            </xsl:for-each>
        </xsl:param>
        <xsl:choose>
            <xsl:when test="ancestor::columns">
                <xsl:choose>
                    <xsl:when test="$column='333'">
                        <table class="tei-table-extra-small">
                            <xsl:attribute name="style">text-align:
                                <xsl:value-of select="@justify"/>
                            </xsl:attribute>
                            <xsl:apply-templates/>
                        </table>
                    </xsl:when>
                    <xsl:otherwise>
                        <table class="tei-table-small">
                            <xsl:attribute name="style">text-align:
                                <xsl:value-of select="@justify"/>
                            </xsl:attribute>
                            <xsl:apply-templates/>
                        </table>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:when>
            <xsl:otherwise>
                <xsl:choose>
                    <xsl:when test="@rend">
                        <table>
                            <xsl:attribute name="width">
                                <xsl:value-of select="substring-after(@rend, 'width:')"/>
                            </xsl:attribute>
                            <xsl:attribute name="style">text-align:
                                <xsl:value-of select="@justify"/>
                            </xsl:attribute>
                            <xsl:apply-templates/>
                        </table>
                    </xsl:when>
                    <xsl:otherwise>
                        <table class="tei-table">
                            <xsl:attribute name="style">text-align:<xsl:value-of select="@justify"/></xsl:attribute>
                            <xsl:apply-templates/>
                        </table>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    <xsl:template match="text()[preceding::delSpan[1]/@spanto=following::anchor[1]/@xml:id]">
        <xsl:variable name="parentType">
            <xsl:value-of select="local-name(..)"/>
        </xsl:variable>
        <xsl:choose>
            <!-- This is pretty bad practice.  We need a better way to deal with this problem in notes... no guarantee that we'll always use
               the HTML rendering tag b for note formatting. -->
            <xsl:when test="$parentType = 'b' or $parentType = 'note'">
                <xsl:value-of select="."/>
            </xsl:when>
            <xsl:when test="preceding::substSpan/@spanto=following::anchor/@xml:id">
                <span class="tei-preceding-delspan-substspan"> <!-- background-color:#ffff99; text-decoration:line-through; -->
                    <xsl:value-of select="."/>
                </span>
            </xsl:when>
            <xsl:otherwise>
                <span class="tei-preceding-delspan">
                    <xsl:value-of select="."/>
                </span>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    <xsl:template match="text()[preceding::addSpan[1]/@spanto=following::anchor[1]/@xml:id]">
        <xsl:variable name="parentType">
            <xsl:value-of select="local-name(..)"/>
        </xsl:variable>
        <xsl:choose>
            <xsl:when test="$parentType = 'b' or $parentType = 'note'">
                <xsl:value-of select="."/>
            </xsl:when>
            <xsl:when test="preceding::substSpan/@spanto=following::anchor/@xml:id">
                <span class="tei-preceding-addspan-substspan"> <!-- style="color: #00ccff; background-color:#ffff99" -->
                    <xsl:value-of select="."/>
                </span>
            </xsl:when>
            <xsl:otherwise>
                <span class="tei-preceding-addspan"><!-- color="#00ccff" -->
                    <xsl:value-of select="."/>
                </span>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    <xsl:template match="l">
        <xsl:variable name="lg-indent"><xsl:value-of select="number(ancestor::lg[1]/@indent)"/></xsl:variable>
        <tr>
            <td class="tei-line-number"> <!-- "width: 5%; font-family:Times New Roman;font-size:8pt;color:gray;" -->
                <xsl:choose>
                    <xsl:when test="not(contains(@n, 'XX'))">
                        <xsl:value-of select="number(substring(@n, string-length(@n) - 1))"/>
                    </xsl:when>
                    <xsl:otherwise>
                        &#160;
                    </xsl:otherwise>
                </xsl:choose>
            </td>
            <td class="tei-line-note"> <!-- width: 5% -->
                <xsl:apply-templates select="note"/>
            </td>
            <td class="tei-line-text"> <!-- width: 90%; font-family:Times New Roman; font-size:12pt -->
                <xsl:attribute name="style">text-align:<xsl:value-of select="@justify"/></xsl:attribute>
                <span>
                    <xsl:choose>
                      <!-- LINE GROUP INDENTATION -->
                        <xsl:when test="$lg-indent &gt; 0">
                          <xsl:call-template name="spacemaker">
                            <xsl:with-param name="spaces">
                              <xsl:value-of select="round($lg-indent * 1.75)"/>
                            </xsl:with-param>
                          </xsl:call-template>
                        </xsl:when>
                      <!-- LINE GROUP INDENTATION ENDS -->
                        <xsl:when test="@justify ='left'">
                            <xsl:if test="@indent">
                                <xsl:call-template name="spacemaker">
                                    <xsl:with-param name="spaces">
                                        <xsl:value-of select="round(@indent * 1.75)"/>
                                    </xsl:with-param>
                                </xsl:call-template>
                            </xsl:if>
                        </xsl:when>
                        <xsl:when test="@justify ='right'"/>
                        <xsl:when test="@justify='center'">
                            <xsl:attribute name="style">text-align:center</xsl:attribute>
                        </xsl:when>
                        <xsl:otherwise/>
                    </xsl:choose>
                    <!-- excludes note from display -->
                    <xsl:apply-templates
                            select="vspace|space|physnumber|text()|foreign|hi|catchword|exist:match|add|del|subst|choose|sic|corr|hspace|orig|rep|instr|unclear|hr|choice|gap"/>
                </span>
            </td>
        </tr>
    </xsl:template>

    <xsl:template match="lexh">
        <tr>
            <td class="tei-line-text"> <!-- width: 90%; font-family:Times New Roman; font-size:12pt -->
                <xsl:attribute name="style">text-align:<xsl:value-of select="@justify"/></xsl:attribute>
                <span>
                    <xsl:choose>
                        <xsl:when test="@justify ='left'">
                            <xsl:if test="@indent">
                                <xsl:call-template name="spacemaker">
                                    <xsl:with-param name="spaces">
                                        <xsl:value-of select="round(@indent * 1.75)"/>
                                    </xsl:with-param>
                                </xsl:call-template>
                            </xsl:if>
                        </xsl:when>
                        <xsl:when test="@justify ='right'"/>
                        <xsl:when test="@justify='center'">
                            <xsl:attribute name="style">text-align:center</xsl:attribute>
                        </xsl:when>
                        <xsl:otherwise/>
                    </xsl:choose>
                    <!-- excludes note from display -->
                    <xsl:apply-templates
                            select="vspace|space|physnumber|text()|foreign|hi|catchword|exist:match|add|del|subst|choose|sic|corr|hspace|orig|rep|instr|unclear|hr|choice|gap"/>
                </span>
            </td>
        </tr>
    </xsl:template>

    <xsl:template match="space">
        <span>
            <xsl:call-template name="spacemaker">
                <xsl:with-param name="spaces">
                    <xsl:value-of select="round(@extent * 1.75)"/>
                </xsl:with-param>
            </xsl:call-template>
        </span>
    </xsl:template>
    <xsl:template match="foreign|physnumber|catchword">
        <xsl:apply-templates/>
    </xsl:template>
    <xsl:template match="note">
        <!-- Probably going to need to review this in the future to enable editor's notes -->
        <!--<a>-->
            <!--<xsl:attribute name="href">javascript:START('<xsl:value-of select="$blakeroot"/>-->
                <!--archive/editornotes.xq?objectid=<xsl:value-of select="/document/@objectid"/>&amp;lineno=<xsl:value-of-->
                        <!--select="xalan:tokenize(ancestor::l/@n, '.')[position() = last()]"/>',-->
                <!--'ednote')-->
            <!--</xsl:attribute>-->
            <!--n-->
        <!--</a>-->
    </xsl:template>
    <xsl:template match="p">
        <p>
            <xsl:if test="@align">
                <xsl:attribute name="align">
                    <xsl:value-of select="@align"/>
                </xsl:attribute>
            </xsl:if>
            <xsl:apply-templates/>
        </p>
    </xsl:template>
    <xsl:template name="spacemaker">
        <xsl:param name="spaces"/>
        <xsl:choose>
            <xsl:when test="$spaces &gt; 0">&#160;<xsl:call-template name="spacemaker"><xsl:with-param name="spaces" select="$spaces -1"/></xsl:call-template></xsl:when>
            <xsl:otherwise/>
        </xsl:choose>
    </xsl:template>
    <xsl:template match="hi">
        <xsl:choose>
            <xsl:when test="@rend='italic' or @rend='i'">
                <span class="tei-hi-italic"> <!--  style="font-style:italic" -->
                    <xsl:apply-templates/>
                </span>
            </xsl:when>
            <xsl:when test="@rend='underscore' or @rend='u'">
                <span class="tei-hi-underscore"> <!-- style="text-decoration:underline" -->
                    <xsl:apply-templates/>
                </span>
            </xsl:when>
            <xsl:when test="@rend='superscript' or @rend='sup'">
                <sup>
                    <xsl:apply-templates/>
                </sup>
            </xsl:when>
            <xsl:when test="@rend='subscript' or @rend='sub'">
                <sub>
                    <xsl:apply-templates/>
                </sub>
            </xsl:when>
            <xsl:when test="@rend= 'roman' or @rend = 'normal'">
                <span class="tei-hi-normal"> <!-- style="font-style:normal" -->
                    <xsl:apply-templates/>
                </span>
            </xsl:when>
            <xsl:otherwise>
                <span class="tei-hi-normal">
                    <xsl:apply-templates/>
                </span>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    <!-- Additional templates to handle del tags nested in subst and substSpan -->
    <xsl:template match="//subst/del[@type='overstrike']">
        <del type="overstrike" class="tei-del-overstrike-subst">
            <xsl:apply-templates/>
        </del>
    </xsl:template>
    <xsl:template match="//del[@type='overstrike' and preceding-sibling::substSpan] | //del[@type='overstrike' and following-sibling::anchor]">
        <del type="overstrike" class="tei-del-overstrike-substspan">
            <xsl:apply-templates/>
        </del>
    </xsl:template>
    <xsl:template match="//del[@type='wash' and preceding-sibling::substSpan] | //del[@type='wash' and following-sibling::anchor]">
        <del type="wash" class="tei-del-overstrike-substspan">
            <xsl:apply-templates/>
        </del>
    </xsl:template>
</xsl:stylesheet>
